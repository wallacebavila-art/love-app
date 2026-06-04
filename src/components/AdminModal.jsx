import React, { useState, useRef, useEffect } from 'react';
import { logger } from '../utils/logger';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { db } from '../services/firebaseConfig';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { fetchAllPhotos, uploadPhotoToStorage, savePhoto, deletePhoto, deletePhotoFromStorage } from '../services/photoService';
import { exportAllData, importAllData, downloadBackup, readBackupFile } from '../services/backupService';
import { useToast } from './Toast';

const AdminModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { getCardBackground, getBorderColor, getTextColor } = useTheme();
  const { warning, success, error } = useToast();
  const messagesEndRef = useRef(null);
  const [activeTab, setActiveTab] = useState('messages'); // 'messages', 'verses', 'photos', 'backup'
  
  // Dados das mensagens
  const [messages, setMessages] = useState([]);
  // Dados dos versículos
  const [verses, setVerses] = useState([]);
  // Dados das fotos
  const [photos, setPhotos] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [messageCount, setMessageCount] = useState(0);
  const [verseCount, setVerseCount] = useState(0);
  const [photoCount, setPhotoCount] = useState(0);
  const [duplicateMessages, setDuplicateMessages] = useState([]);
  const [duplicateVerses, setDuplicateVerses] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    date: '',
    content: '',
    reference: '',
    caption: '',
    files: []
  });
  const [selectedFilePreviews, setSelectedFilePreviews] = useState([]);

  // Estado para backup
  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [backupMessage, setBackupMessage] = useState('');
  const [overwriteBackup, setOverwriteBackup] = useState(false);
  const [clearBeforeImport, setClearBeforeImport] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchStatistics();
      fetchMessages();
      fetchVerses();
      fetchPhotos();
    }
  }, [isOpen]);

  useEffect(() => {
    if (messages.length > 0 || verses.length > 0) {
      detectDuplicates();
    }
  }, [messages, verses]);

  const findDuplicates = (items, getText, getDate) => {
    const duplicates = [];
    const seenTexts = new Map();
    const seenDates = new Map();

    items.forEach(item => {
      const text = getText(item);
      const date = getDate(item);

      // Verificar duplicado de texto
      if (text) {
        if (seenTexts.has(text)) {
          duplicates.push({
            type: 'text',
            value: text,
            items: [seenTexts.get(text), item]
          });
        } else {
          seenTexts.set(text, item);
        }
      }

      // Verificar duplicado de data
      if (date) {
        if (seenDates.has(date)) {
          duplicates.push({
            type: 'date',
            value: date,
            items: [seenDates.get(date), item]
          });
        } else {
          seenDates.set(date, item);
        }
      }
    });

    return duplicates;
  };

  const detectDuplicates = () => {
    const msgDuplicates = findDuplicates(
      messages,
      (item) => item.mensagem?.toLowerCase().trim(),
      (item) => item.date || item.id
    );
    setDuplicateMessages(msgDuplicates);

    const verseDuplicates = findDuplicates(
      verses,
      (item) => item.text?.toLowerCase().trim(),
      (item) => item.date || item.id
    );
    setDuplicateVerses(verseDuplicates);
  };

  const fetchStatistics = async () => {
    try {
      const messagesSnapshot = await getDocs(collection(db, 'mensagens'));
      setMessageCount(messagesSnapshot.size);

      const versesSnapshot = await getDocs(collection(db, 'verses'));
      setVerseCount(versesSnapshot.size);

      const photosSnapshot = await getDocs(collection(db, 'photos'));
      setPhotoCount(photosSnapshot.size);
    } catch (error) {
      logger.error('Erro ao buscar estatísticas:', error);
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
      logger.error('Erro ao buscar mensagens:', error);
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
      logger.error('Erro ao buscar versículos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPhotos = async () => {
    try {
      const photosData = await fetchAllPhotos();
      setPhotos(photosData);
    } catch (error) {
      logger.error('Erro ao buscar fotos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    logger.log('🚀 handleAddSubmit chamado, activeTab:', activeTab);
    try {
      if (activeTab === 'photos') {
        logger.log('📷 Processando upload de fotos');
        if (!formData.files || formData.files.length === 0) {
          warning('Por favor, selecione pelo menos uma foto');
          return;
        }

        logger.log('📸 Arquivos selecionados:', formData.files.length);

        const successfulUploads = [];
        const failedUploads = [];

        // Processar cada arquivo
        for (let i = 0; i < formData.files.length; i++) {
          const file = formData.files[i];
          logger.log(`📸 Processando arquivo ${i + 1}/${formData.files.length}:`, file.name, 'Tamanho:', file.size);

          try {
            // Upload para Firebase Storage
            const fileName = `${Date.now()}_${file.name}`;
            const downloadURL = await uploadPhotoToStorage(file, fileName);

            if (downloadURL) {
              // Salvar metadados no Firestore
              const photoId = await savePhoto({
                url: downloadURL,
                caption: formData.caption || '',
                order: photos.length + i,
                isStorage: true
              });

              if (photoId) {
                logger.log(`✅ Foto ${i + 1} salva com sucesso, ID:`, photoId);
                successfulUploads.push(file.name);
              } else {
                logger.log(`❌ Foto ${i + 1} falhou ao salvar metadados`);
                failedUploads.push(file.name);
              }
            } else {
              logger.log(`❌ Foto ${i + 1} falhou no upload para Storage`);
              failedUploads.push(file.name);
            }
          } catch (error) {
            logger.error(`❌ Erro ao processar foto ${i + 1} (${file.name}):`, error);
            failedUploads.push(file.name);
          }
        }

        if (failedUploads.length > 0) {
          warning(`${successfulUploads.length} foto(s) enviada(s) com sucesso!\n\nFalhas: ${failedUploads.length} foto(s)\n${failedUploads.join(', ')}`);
        } else {
          success(`${successfulUploads.length} foto(s) enviada(s) com sucesso!`);
        }
        resetForm();
        fetchStatistics();
        fetchPhotos();
        window.location.reload();
      } else {
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
      }
    } catch (error) {
      logger.error('Erro ao adicionar item:', error);
      error('Erro ao adicionar item: ' + error.message);
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
      logger.error('Erro ao atualizar item:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este item?')) {
      try {
        if (activeTab === 'photos') {
          const photo = photos.find(p => p.id === id);
          if (photo && !photo.isLocal) {
            await deletePhotoFromStorage(photo.url);
          }
          await deletePhoto(id);
          fetchStatistics();
          fetchPhotos();
        } else {
          const collectionName = activeTab === 'messages' ? 'mensagens' : 'verses';
          await deleteDoc(doc(db, collectionName, id));
          
          fetchStatistics();
          if (activeTab === 'messages') fetchMessages();
          else fetchVerses();
        }
      } catch (error) {
        logger.error('Erro ao excluir item:', error);
      }
    }
  };

  // Funções de backup
  const handleExportBackup = async () => {
    setBackupLoading(true);
    setBackupMessage('');
    try {
      const backupData = await exportAllData();
      downloadBackup(backupData);
      setBackupMessage('✅ Backup exportado com sucesso!');
    } catch (error) {
      logger.error('Erro ao exportar backup:', error);
      setBackupMessage('❌ Erro ao exportar backup: ' + error.message);
    } finally {
      setBackupLoading(false);
    }
  };

  const handleImportBackup = async (file) => {
    setRestoreLoading(true);
    setBackupMessage('');
    try {
      const backupData = await readBackupFile(file);
      const result = await importAllData(backupData, {
        overwrite: overwriteBackup,
        clearBeforeImport: clearBeforeImport
      });
      
      if (result.success) {
        setBackupMessage('✅ Backup importado com sucesso!');
        // Recarregar dados
        await fetchStatistics();
        await fetchMessages();
        await fetchVerses();
        await fetchPhotos();
      } else {
        setBackupMessage('⚠️ Backup importado com erros. Veja o logger para detalhes.');
      }
    } catch (error) {
      logger.error('Erro ao importar backup:', error);
      setBackupMessage('❌ Erro ao importar backup: ' + error.message);
    } finally {
      setRestoreLoading(false);
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
    setFormData({ date: '', content: '', reference: '', caption: '', files: [] });
    setSelectedFilePreviews([]);
    setShowAddForm(false);
    setEditingItem(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      <div className={`relative ${getCardBackground()} backdrop-blur-[24px] -webkit-backdrop-blur-[24px] border ${getBorderColor()} rounded-[32px] shadow-2xl shadow-black/10 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col`}>
        {/* Header */}
        <div className={`px-6 py-4 flex justify-between items-center border-b ${getBorderColor()}`}>
          <h2 className={`text-2xl font-bold ${getTextColor()}`}>Dashboard Administrativo</h2>
          <button
            onClick={onClose}
            className={`${getTextColor()} hover:bg-white/20 rounded-full p-2 transition`}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Estatísticas */}
          <div className="mb-6">
            <h3 className={`text-lg font-semibold ${getTextColor()} mb-3`}>Estatísticas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-pink-400 text-3xl">chat_bubble</span>
                  <div>
                    <p className="text-sm text-white/60">Mensagens do Dia</p>
                    <p className="text-3xl font-bold text-pink-400">{messageCount}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-blue-400 text-3xl">menu_book</span>
                  <div>
                    <p className="text-sm text-white/60">Versículos do Dia</p>
                    <p className="text-3xl font-bold text-blue-400">{verseCount}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-green-400 text-3xl">photo_library</span>
                  <div>
                    <p className="text-sm text-white/60">Fotos na Galeria</p>
                    <p className="text-3xl font-bold text-green-400">{photoCount}</p>
                  </div>
                </div>
              </div>
              <div className={`rounded-xl p-4 border backdrop-blur-md ${duplicateMessages.length > 0 ? 'bg-red-500/20 border-red-400/30' : 'bg-green-500/20 border-green-400/30'}`}>
                <div className="flex items-center gap-3">
                  <span className={`material-symbols-outlined text-3xl ${duplicateMessages.length > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {duplicateMessages.length > 0 ? 'warning' : 'check_circle'}
                  </span>
                  <div>
                    <p className="text-sm text-white/60">Mensagens Duplicadas</p>
                    <p className={`text-3xl font-bold ${duplicateMessages.length > 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {duplicateMessages.length}
                    </p>
                  </div>
                </div>
              </div>
              <div className={`rounded-xl p-4 border backdrop-blur-md ${duplicateVerses.length > 0 ? 'bg-red-500/20 border-red-400/30' : 'bg-green-500/20 border-green-400/30'}`}>
                <div className="flex items-center gap-3">
                  <span className={`material-symbols-outlined text-3xl ${duplicateVerses.length > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {duplicateVerses.length > 0 ? 'warning' : 'check_circle'}
                  </span>
                  <div>
                    <p className="text-sm text-white/60">Versículos Duplicados</p>
                    <p className={`text-3xl font-bold ${duplicateVerses.length > 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {duplicateVerses.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Duplicatas */}
          {(duplicateMessages.length > 0 || duplicateVerses.length > 0) && (
            <div className="mb-6">
              <h3 className={`text-lg font-semibold ${getTextColor()} mb-3`}>⚠️ Itens Duplicados</h3>

              {duplicateMessages.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-md font-semibold text-pink-400 mb-2">Mensagens Duplicadas</h4>
                  <div className="space-y-3">
                    {duplicateMessages.map((dup, idx) => (
                      <div key={idx} className="bg-red-500/20 border border-red-400/30 rounded-lg p-4 backdrop-blur-md">
                        <p className="text-sm font-semibold text-red-400 mb-2">
                          {dup.type === 'date' ? `Duplicado de data: ${dup.value}` : 'Duplicado de texto'}
                        </p>
                        <div className="space-y-2">
                          {dup.items.map((item, itemIdx) => (
                            <div key={itemIdx} className="flex justify-between items-start bg-white/10 p-3 rounded border border-red-400/20">
                              <div className="flex-1">
                                <p className="text-xs text-white/60">{item.date || item.id}</p>
                                <p className="text-sm text-white">{item.mensagem}</p>
                              </div>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="ml-2 px-2 py-1 bg-red-500/50 text-white text-xs rounded hover:bg-red-500/70 transition"
                              >
                                Excluir
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {duplicateVerses.length > 0 && (
                <div>
                  <h4 className="text-md font-semibold text-blue-400 mb-2">Versículos Duplicados</h4>
                  <div className="space-y-3">
                    {duplicateVerses.map((dup, idx) => (
                      <div key={idx} className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-4 backdrop-blur-md">
                        <p className="text-sm font-semibold text-blue-400 mb-2">
                          {dup.type === 'date' ? `Duplicado de data: ${dup.value}` : 'Duplicado de texto'}
                        </p>
                        <div className="space-y-2">
                          {dup.items.map((item, itemIdx) => (
                            <div key={itemIdx} className="flex justify-between items-start bg-white/10 p-3 rounded border border-blue-400/20">
                              <div className="flex-1">
                                <p className="text-xs text-white/60">{item.date || item.id}</p>
                                <p className="text-sm text-white">{item.text}</p>
                                {item.reference && <p className="text-xs text-purple-400 font-semibold">{item.reference}</p>}
                              </div>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="ml-2 px-2 py-1 bg-red-500/50 text-white text-xs rounded hover:bg-red-500/70 transition"
                              >
                                Excluir
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tabs */}
          <div className={`flex gap-2 mb-6 border-b ${getBorderColor()}`}>
            <button
              onClick={() => { setActiveTab('messages'); resetForm(); }}
              className={`px-6 py-3 font-semibold transition-all border-b-2 ${
                activeTab === 'messages'
                  ? 'border-pink-400 text-pink-400'
                  : 'border-transparent text-white/60 hover:text-white'
              }`}
            >
              Mensagens do Dia
            </button>
            <button
              onClick={() => { setActiveTab('verses'); resetForm(); }}
              className={`px-6 py-3 font-semibold transition-all border-b-2 ${
                activeTab === 'verses'
                  ? 'border-blue-400 text-blue-400'
                  : 'border-transparent text-white/60 hover:text-white'
              }`}
            >
              Versículos do Dia
            </button>
            <button
              onClick={() => { setActiveTab('photos'); resetForm(); }}
              className={`px-6 py-3 font-semibold transition-all border-b-2 ${
                activeTab === 'photos'
                  ? 'border-green-400 text-green-400'
                  : 'border-transparent text-white/60 hover:text-white'
              }`}
            >
              Fotos
            </button>
            <button
              onClick={() => { setActiveTab('backup'); resetForm(); }}
              className={`px-6 py-3 font-semibold transition-all border-b-2 ${
                activeTab === 'backup'
                  ? 'border-purple-400 text-purple-400'
                  : 'border-transparent text-white/60 hover:text-white'
              }`}
            >
              Backup
            </button>
          </div>

          {/* Add Button */}
          <div className="mb-6">
            {activeTab !== 'photos' && activeTab !== 'backup' && (
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
            )}
          </div>

          {/* Add/Edit Form */}
          {showAddForm && activeTab !== 'photos' && activeTab !== 'backup' && (
            <div className={`rounded-lg p-6 mb-6 border backdrop-blur-md ${
              activeTab === 'messages'
                ? 'bg-pink-500/20 border-pink-400/30'
                : 'bg-blue-500/20 border-blue-400/30'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${getTextColor()}`}>
                {editingItem ? 'Editar' : 'Adicionar Novo'} {activeTab === 'messages' ? 'Mensagem' : 'Versículo'}
              </h3>
              <form onSubmit={editingItem ? handleEditSubmit : handleAddSubmit} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium text-white/80 mb-2`}>
                    Data (YYYY-MM-DD)
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none text-white"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium text-white/80 mb-2`}>
                    {activeTab === 'messages' ? 'Texto da Mensagem' : 'Texto do Versículo'}
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    required
                    rows="3"
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none text-white"
                    placeholder={activeTab === 'messages' ? 'Sua mensagem de amor...' : 'Porque Deus amou o mundo...'}
                  />
                </div>
                {activeTab === 'verses' && (
                  <div>
                    <label className={`block text-sm font-medium text-white/80 mb-2`}>
                      Referência
                    </label>
                    <input
                      type="text"
                      value={formData.reference}
                      onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                      required
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none text-white"
                      placeholder="João 3:16"
                    />
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className={`flex-1 px-6 py-2 rounded-lg transition font-semibold text-white ${
                      activeTab === 'messages'
                        ? 'bg-pink-500/50 hover:bg-pink-500/70'
                        : 'bg-blue-500/50 hover:bg-blue-500/70'
                    }`}
                  >
                    {editingItem ? 'Atualizar' : 'Salvar'}
                  </button>
                  {editingItem && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 px-6 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition font-semibold"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* Photo Upload Form */}
          {activeTab === 'photos' && (
            <div className="rounded-lg p-6 mb-6 border bg-green-500/20 border-green-400/30 backdrop-blur-md">
              <h3 className={`text-lg font-semibold mb-4 ${getTextColor()}`}>Adicionar Nova Foto</h3>
              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium text-white/80 mb-2`}>
                    Selecione Fotos (pode selecionar múltiplas)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files);
                      if (files.length > 0) {
                        setFormData({ ...formData, files });

                        // Criar previews para todos os arquivos
                        const previews = [];
                        files.forEach((file) => {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            previews.push({ file, preview: reader.result });
                            if (previews.length === files.length) {
                              setSelectedFilePreviews(previews);
                            }
                          };
                          reader.readAsDataURL(file);
                        });
                      }
                    }}
                    required
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none text-white"
                  />
                  {selectedFilePreviews.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm text-white/60 mb-2">{selectedFilePreviews.length} foto(s) selecionada(s)</p>
                      <div className="grid grid-cols-3 gap-2">
                        {selectedFilePreviews.map((item, index) => (
                          <div key={index}>
                            <img
                              src={item.preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border border-white/20"
                            />
                            <p className="text-xs text-white/60 mt-1 truncate">{item.file.name}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label className={`block text-sm font-medium text-white/80 mb-2`}>
                    Legenda (opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.caption}
                    onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none text-white"
                    placeholder="Nossa memória especial..."
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-500/50 text-white rounded-lg hover:bg-green-500/70 transition font-semibold"
                >
                  Upload Foto
                </button>
              </form>
            </div>
          )}

          {/* List */}
          {activeTab === 'photos' ? (
            <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 overflow-hidden">
              <div className={`px-6 py-4 border-b ${getBorderColor()} bg-white/5`}>
                <h3 className={`text-lg font-semibold ${getTextColor()}`}>
                  Fotos na Galeria ({photos.length})
                </h3>
              </div>
              <div className="p-4 max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="px-6 py-8 text-center text-white/60">Carregando...</div>
                ) : photos.length === 0 ? (
                  <div className="px-6 py-8 text-center text-white/60">
                    Nenhuma foto encontrada
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {photos.map((photo) => (
                      <div key={photo.id} className="relative group">
                        <img
                          src={photo.url}
                          alt={photo.caption || 'Foto'}
                          className="w-full h-32 object-cover rounded-lg shadow-md"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleDelete(photo.id)}
                            className="px-3 py-1 bg-red-500/50 text-white rounded hover:bg-red-500/70 transition text-sm"
                          >
                            Excluir
                          </button>
                        </div>
                        {photo.caption && (
                          <p className="text-xs text-white/60 mt-1 truncate">{photo.caption}</p>
                        )}
                        {photo.isLocal && (
                          <span className="text-[8px] text-white/40">Local</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'backup' ? (
            <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 overflow-hidden">
              <div className={`px-6 py-4 border-b ${getBorderColor()} bg-white/5`}>
                <h3 className={`text-lg font-semibold ${getTextColor()}`}>
                  Backup e Restauração
                </h3>
              </div>
              <div className="p-6 space-y-6">
                {/* Exportar Backup */}
                <div className="bg-purple-500/20 border border-purple-400/30 rounded-lg p-6">
                  <h4 className={`text-lg font-semibold mb-4 ${getTextColor()}`}>Exportar Backup</h4>
                  <p className="text-white/70 mb-4 text-sm">
                    Exporte todos os dados do app (mensagens, versículos, fotos, etc.) para um arquivo JSON.
                  </p>
                  <button
                    onClick={handleExportBackup}
                    disabled={backupLoading}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {backupLoading ? 'Exportando...' : '📥 Exportar Backup'}
                  </button>
                </div>

                {/* Importar Backup */}
                <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-6">
                  <h4 className={`text-lg font-semibold mb-4 ${getTextColor()}`}>Restaurar Backup</h4>
                  <p className="text-white/70 mb-4 text-sm">
                    Importe um arquivo de backup para restaurar os dados do app.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        accept=".json"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) handleImportBackup(file);
                        }}
                        disabled={restoreLoading}
                        className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-500 file:text-white hover:file:bg-purple-600 disabled:opacity-50"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={overwriteBackup}
                          onChange={(e) => setOverwriteBackup(e.target.checked)}
                          className="w-4 h-4 rounded"
                        />
                        <span className="text-white/80 text-sm">Sobrescrever documentos existentes</span>
                      </label>
                      
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={clearBeforeImport}
                          onChange={(e) => setClearBeforeImport(e.target.checked)}
                          className="w-4 h-4 rounded"
                        />
                        <span className="text-white/80 text-sm">Limpar coleções antes de importar</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Mensagem de status */}
                {backupMessage && (
                  <div className={`p-4 rounded-lg ${
                    backupMessage.includes('✅') ? 'bg-green-500/20 border border-green-400/30' :
                    backupMessage.includes('❌') ? 'bg-red-500/20 border border-red-400/30' :
                    'bg-yellow-500/20 border border-yellow-400/30'
                  }`}>
                    <p className="text-white">{backupMessage}</p>
                  </div>
                )}

                {/* Estatísticas */}
                <div className="bg-white/10 border border-white/20 rounded-lg p-6">
                  <h4 className={`text-lg font-semibold mb-4 ${getTextColor()}`}>Estatísticas Atuais</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-pink-400">{messageCount}</p>
                      <p className="text-white/70 text-sm">Mensagens</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-blue-400">{verseCount}</p>
                      <p className="text-white/70 text-sm">Versículos</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-400">{photoCount}</p>
                      <p className="text-white/70 text-sm">Fotos</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 overflow-hidden">
              <div className={`px-6 py-4 border-b ${getBorderColor()} bg-white/5`}>
                <h3 className={`text-lg font-semibold ${getTextColor()}`}>
                  {activeTab === 'messages' ? 'Mensagens' : 'Versículos'} ({activeTab === 'messages' ? messages.length : verses.length})
                </h3>
              </div>
              <div className={`divide-y ${getBorderColor()} max-h-64 overflow-y-auto`}>
                {loading ? (
                  <div className="px-6 py-8 text-center text-white/60">Carregando...</div>
                ) : (activeTab === 'messages' ? messages : verses).length === 0 ? (
                  <div className="px-6 py-8 text-center text-white/60">
                    Nenhum item encontrado
                  </div>
                ) : (
                  (activeTab === 'messages' ? messages : verses).map((item) => (
                    <div key={item.id} className="px-6 py-4 hover:bg-white/10 transition">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="text-sm text-white/60 mb-1">{item.date || item.id}</p>
                          <p className="text-white font-medium mb-1">
                            {activeTab === 'messages' ? item.mensagem : item.text}
                          </p>
                          {activeTab === 'verses' && item.reference && (
                            <p className="text-sm text-purple-400 font-semibold">{item.reference}</p>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleEdit(item)}
                            className={`px-3 py-1 rounded transition text-sm text-white ${
                              activeTab === 'messages'
                                ? 'bg-pink-500/50 hover:bg-pink-500/70'
                                : 'bg-blue-500/50 hover:bg-blue-500/70'
                            }`}
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="px-3 py-1 bg-red-500/50 text-white rounded hover:bg-red-500/70 transition text-sm"
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
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminModal;
