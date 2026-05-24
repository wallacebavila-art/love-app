import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/firebaseConfig';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

const AdminModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('messages'); // 'messages' or 'verses'
  
  // Dados das mensagens
  const [messages, setMessages] = useState([]);
  // Dados dos versículos
  const [verses, setVerses] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [messageCount, setMessageCount] = useState(0);
  const [verseCount, setVerseCount] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    date: '',
    content: '',
    reference: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchStatistics();
      fetchMessages();
      fetchVerses();
    }
  }, [isOpen]);

  const fetchStatistics = async () => {
    try {
      const messagesSnapshot = await getDocs(collection(db, 'mensagens'));
      setMessageCount(messagesSnapshot.size);

      const versesSnapshot = await getDocs(collection(db, 'verses'));
      setVerseCount(versesSnapshot.size);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'mensagens'));
      const data = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      data.sort((a, b) => (a.date || a.id).localeCompare(b.date || b.id));
      setMessages(data);
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVerses = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'verses'));
      const data = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      data.sort((a, b) => (a.date || a.id).localeCompare(b.date || b.id));
      setVerses(data);
    } catch (error) {
      console.error('Erro ao buscar versículos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const collectionName = activeTab === 'messages' ? 'mensagens' : 'verses';
      
      if (activeTab === 'messages') {
        await addDoc(collection(db, collectionName), {
          date: formData.date,
          mensagem: formData.content
        });
      } else {
        await addDoc(collection(db, collectionName), {
          date: formData.date,
          text: formData.content,
          reference: formData.reference
        });
      }
      
      resetForm();
      fetchStatistics();
      if (activeTab === 'messages') fetchMessages();
      else fetchVerses();
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const collectionName = activeTab === 'messages' ? 'mensagens' : 'verses';
      const itemRef = doc(db, collectionName, editingItem.id);
      
      if (activeTab === 'messages') {
        await updateDoc(itemRef, {
          date: formData.date,
          mensagem: formData.content
        });
      } else {
        await updateDoc(itemRef, {
          date: formData.date,
          text: formData.content,
          reference: formData.reference
        });
      }
      
      resetForm();
      fetchStatistics();
      if (activeTab === 'messages') fetchMessages();
      else fetchVerses();
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este item?')) {
      try {
        const collectionName = activeTab === 'messages' ? 'mensagens' : 'verses';
        await deleteDoc(doc(db, collectionName, id));
        
        fetchStatistics();
        if (activeTab === 'messages') fetchMessages();
        else fetchVerses();
      } catch (error) {
        console.error('Erro ao excluir item:', error);
      }
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    if (activeTab === 'messages') {
      setFormData({
        date: item.date || item.id,
        content: item.mensagem || '',
        reference: ''
      });
    } else {
      setFormData({
        date: item.date || item.id,
        content: item.text || '',
        reference: item.reference || ''
      });
    }
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({ date: '', content: '', reference: '' });
    setShowAddForm(false);
    setEditingItem(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Dashboard Administrativo</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Estatísticas */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Estatísticas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-pink-600 text-3xl">chat_bubble</span>
                  <div>
                    <p className="text-sm text-gray-600">Mensagens do Dia</p>
                    <p className="text-3xl font-bold text-pink-600">{messageCount}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-blue-600 text-3xl">menu_book</span>
                  <div>
                    <p className="text-sm text-gray-600">Versículos do Dia</p>
                    <p className="text-3xl font-bold text-blue-600">{verseCount}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-gray-200">
            <button
              onClick={() => { setActiveTab('messages'); resetForm(); }}
              className={`px-6 py-3 font-semibold transition-all border-b-2 ${
                activeTab === 'messages' 
                  ? 'border-pink-500 text-pink-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Mensagens do Dia
            </button>
            <button
              onClick={() => { setActiveTab('verses'); resetForm(); }}
              className={`px-6 py-3 font-semibold transition-all border-b-2 ${
                activeTab === 'verses' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Versículos do Dia
            </button>
          </div>

          {/* Add Button */}
          <div className="mb-6">
            <button
              onClick={() => {
                if (showAddForm) resetForm();
                else setShowAddForm(true);
              }}
              className={`px-6 py-3 rounded-lg transition font-semibold ${
                activeTab === 'messages'
                  ? 'bg-pink-600 text-white hover:bg-pink-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {showAddForm ? 'Cancelar' : `+ Adicionar ${activeTab === 'messages' ? 'Mensagem' : 'Versículo'}`}
            </button>
          </div>

          {/* Add/Edit Form */}
          {showAddForm && (
            <div className={`rounded-lg p-6 mb-6 border ${
              activeTab === 'messages' 
                ? 'bg-pink-50 border-pink-200' 
                : 'bg-blue-50 border-blue-200'
            }`}>
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                {editingItem ? 'Editar' : 'Adicionar Novo'} {activeTab === 'messages' ? 'Mensagem' : 'Versículo'}
              </h3>
              <form onSubmit={editingItem ? handleEditSubmit : handleAddSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data (YYYY-MM-DD)
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {activeTab === 'messages' ? 'Texto da Mensagem' : 'Texto do Versículo'}
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    required
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    placeholder={activeTab === 'messages' ? 'Sua mensagem de amor...' : 'Porque Deus amou o mundo...'}
                  />
                </div>
                {activeTab === 'verses' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Referência
                    </label>
                    <input
                      type="text"
                      value={formData.reference}
                      onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                      placeholder="João 3:16"
                    />
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className={`px-6 py-2 rounded-lg transition font-semibold text-white ${
                      activeTab === 'messages'
                        ? 'bg-pink-600 hover:bg-pink-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {editingItem ? 'Atualizar' : 'Salvar'}
                  </button>
                  {editingItem && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition font-semibold"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* List */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold">
                {activeTab === 'messages' ? 'Mensagens' : 'Versículos'} ({activeTab === 'messages' ? messages.length : verses.length})
              </h3>
            </div>
            <div className="divide-y divide-gray-200 max-h-64 overflow-y-auto">
              {loading ? (
                <div className="px-6 py-8 text-center text-gray-500">Carregando...</div>
              ) : (activeTab === 'messages' ? messages : verses).length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  Nenhum item encontrado
                </div>
              ) : (
                (activeTab === 'messages' ? messages : verses).map((item) => (
                  <div key={item.id} className="px-6 py-4 hover:bg-gray-50 transition">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 mb-1">{item.date || item.id}</p>
                        <p className="text-gray-800 font-medium mb-1">
                          {activeTab === 'messages' ? item.mensagem : item.text}
                        </p>
                        {activeTab === 'verses' && item.reference && (
                          <p className="text-sm text-purple-600 font-semibold">{item.reference}</p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleEdit(item)}
                          className={`px-3 py-1 rounded transition text-sm text-white ${
                            activeTab === 'messages'
                              ? 'bg-pink-500 hover:bg-pink-600'
                              : 'bg-blue-500 hover:bg-blue-600'
                          }`}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminModal;
