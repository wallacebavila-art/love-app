import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/firebaseConfig';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVerse, setEditingVerse] = useState(null);
  const [formData, setFormData] = useState({
    id_dia: '',
    versiculo_texto: '',
    versiculo_ref: ''
  });

  useEffect(() => {
    fetchVerses();
  }, []);

  const fetchVerses = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'mensagens'));
      const versesData = [];
      querySnapshot.forEach((doc) => {
        versesData.push({ id: doc.id, ...doc.data() });
      });
      setVerses(versesData);
    } catch (error) {
      console.error('Erro ao buscar versículos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const date = new Date();
      date.setDate(date.getDate() + parseInt(formData.id_dia) - 1);
      const dateStr = date.toISOString().split('T')[0];
      
      await addDoc(collection(db, 'mensagens'), {
        date: dateStr,
        mensagem: `${formData.versiculo_texto} - ${formData.versiculo_ref}`
      });
      
      setFormData({ id_dia: '', versiculo_texto: '', versiculo_ref: '' });
      setShowAddForm(false);
      fetchVerses();
    } catch (error) {
      console.error('Erro ao adicionar versículo:', error);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const verseRef = doc(db, 'mensagens', editingVerse.id);
      await updateDoc(verseRef, {
        mensagem: `${formData.versiculo_texto} - ${formData.versiculo_ref}`
      });
      
      setEditingVerse(null);
      setFormData({ id_dia: '', versiculo_texto: '', versiculo_ref: '' });
      fetchVerses();
    } catch (error) {
      console.error('Erro ao atualizar versículo:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este versículo?')) {
      try {
        await deleteDoc(doc(db, 'mensagens', id));
        fetchVerses();
      } catch (error) {
        console.error('Erro ao excluir versículo:', error);
      }
    }
  };

  const handleEdit = (verse) => {
    setEditingVerse(verse);
    const parts = verse.mensagem.split(' - ');
    setFormData({
      id_dia: '',
      versiculo_texto: parts[0] || '',
      versiculo_ref: parts[1] || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingVerse(null);
    setFormData({ id_dia: '', versiculo_texto: '', versiculo_ref: '' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-600">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Administrativo</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
            >
              Sair
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Add Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition font-semibold"
          >
            {showAddForm ? 'Cancelar' : '+ Adicionar Versículo'}
          </button>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Adicionar Novo Versículo</h2>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dia (número)
                </label>
                <input
                  type="number"
                  value={formData.id_dia}
                  onChange={(e) => setFormData({ ...formData, id_dia: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  placeholder="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Texto do Versículo
                </label>
                <textarea
                  value={formData.versiculo_texto}
                  onChange={(e) => setFormData({ ...formData, versiculo_texto: e.target.value })}
                  required
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  placeholder="O amor é paciente..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Referência
                </label>
                <input
                  type="text"
                  value={formData.versiculo_ref}
                  onChange={(e) => setFormData({ ...formData, versiculo_ref: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  placeholder="1 Coríntios 13:4-7"
                />
              </div>
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition font-semibold"
              >
                Salvar
              </button>
            </form>
          </div>
        )}

        {/* Edit Form */}
        {editingVerse && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-2 border-purple-500">
            <h2 className="text-xl font-semibold mb-4">Editar Versículo</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Texto do Versículo
                </label>
                <textarea
                  value={formData.versiculo_texto}
                  onChange={(e) => setFormData({ ...formData, versiculo_texto: e.target.value })}
                  required
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Referência
                </label>
                <input
                  type="text"
                  value={formData.versiculo_ref}
                  onChange={(e) => setFormData({ ...formData, versiculo_ref: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  Atualizar
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition font-semibold"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Verses List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Versículos ({verses.length})</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {verses.map((verse) => (
              <div key={verse.id} className="px-6 py-4 hover:bg-gray-50 transition">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">{verse.date}</p>
                    <p className="text-gray-800 font-medium mb-1">{verse.mensagem}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(verse)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition text-sm"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(verse.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition text-sm"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {verses.length === 0 && (
              <div className="px-6 py-8 text-center text-gray-500">
                Nenhum versículo encontrado
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
