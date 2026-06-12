import { db } from './firebaseConfig';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';

const PLAYLISTS_COLLECTION = 'playlists';

/**
 * Busca todas as playlists do Firestore
 * @returns {Promise<Array>} Array de playlists
 */
export const fetchPlaylists = async () => {
  try {
    const q = query(collection(db, PLAYLISTS_COLLECTION), orderBy('name'));
    const querySnapshot = await getDocs(q);
    const playlists = [];
    querySnapshot.forEach((doc) => {
      playlists.push({ 
        firestoreDocId: doc.id, 
        ...doc.data() 
      });
    });
    return playlists;
  } catch (error) {
    console.error('Erro ao buscar playlists:', error);
    return [];
  }
};

/**
 * Adiciona uma nova playlist ao Firestore
 * @param {Object} playlist - Objeto da playlist { id, name, description }
 * @returns {Promise<DocumentReference>} Referência do documento criado
 */
export const addPlaylist = async (playlist) => {
  try {
    const docRef = await addDoc(collection(db, PLAYLISTS_COLLECTION), {
      id: playlist.id,
      name: playlist.name,
      description: playlist.description,
      createdAt: new Date()
    });
    return docRef;
  } catch (error) {
    console.error('Erro ao adicionar playlist:', error);
    throw error;
  }
};

/**
 * Atualiza uma playlist no Firestore
 * @param {string} docId - ID do documento no Firestore
 * @param {Object} playlist - Objeto da playlist { id, name, description }
 * @returns {Promise<boolean>} True se atualizado com sucesso
 */
export const updatePlaylist = async (docId, playlist) => {
  try {
    const playlistRef = doc(db, PLAYLISTS_COLLECTION, docId);
    await updateDoc(playlistRef, {
      id: playlist.id,
      name: playlist.name,
      description: playlist.description,
      updatedAt: new Date()
    });
    return true;
  } catch (error) {
    console.error('Erro ao atualizar playlist:', error);
    return false;
  }
};

/**
 * Remove uma playlist do Firestore
 * @param {string} docId - ID do documento no Firestore
 * @returns {Promise<boolean>} True se removido com sucesso
 */
export const removePlaylist = async (docId) => {
  try {
    const playlistRef = doc(db, PLAYLISTS_COLLECTION, docId);
    await deleteDoc(playlistRef);
    return true;
  } catch (error) {
    console.error('Erro ao remover playlist:', error);
    return false;
  }
};

/**
 * Inicializa a playlist padrão se não existir
 * @returns {Promise<void>}
 */
export const initializeDefaultPlaylist = async () => {
  try {
    const playlists = await fetchPlaylists();
    const defaultPlaylistId = 'PL7Z2KjbeQrjT0TQw0_3JZAFJF9hhwdVOQ';
    
    const exists = playlists.some(p => p.id === defaultPlaylistId);
    
    if (!exists) {
      await addDoc(collection(db, PLAYLISTS_COLLECTION), {
        id: defaultPlaylistId,
        name: 'Playlist Principal',
        description: 'Nossa playlist principal',
        createdAt: new Date()
      });
      console.log('✅ Playlist padrão inicializada no Firestore');
    }
  } catch (error) {
    console.error('Erro ao inicializar playlist padrão:', error);
  }
};
