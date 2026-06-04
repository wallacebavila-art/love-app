import { db } from './firebaseConfig';
import { logger } from '../utils/logger';
import { doc, getDoc, collection, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy, limit, startAfter } from 'firebase/firestore';

const PHOTOS_COLLECTION = 'photos';

// Fotos locais servidas da pasta public/photos/ como fallback
const LOCAL_PHOTOS = [
  { id: 'local-1', url: '/photos/foto1.jpg', caption: 'Nossas Memórias 💕', order: 0, isLocal: true },
  { id: 'local-2', url: '/photos/foto2.jpg', caption: 'Momentos Especiais ✨', order: 1, isLocal: true },
  { id: 'local-3', url: '/photos/foto3.jpg', caption: 'Juntos para Sempre 💑', order: 2, isLocal: true },
];

/**
 * Busca todas as fotos do Firestore com fallback para fotos locais
 * @param {number} maxPhotos - Número máximo de fotos para carregar (padrão: todas)
 * @returns {Promise<Array>} Array de fotos
 */
export const fetchAllPhotos = async (maxPhotos = null) => {
  try {
    const photosRef = collection(db, PHOTOS_COLLECTION);
    let q = query(photosRef, orderBy('order'));
    
    if (maxPhotos) {
      q = query(q, limit(maxPhotos));
    }
    
    const snapshot = await getDocs(q);
    
    const firebasePhotos = [];
    snapshot.forEach((doc) => {
      firebasePhotos.push({ id: doc.id, ...doc.data(), isLocal: false });
    });
    
    // Ordenar fotos do Firebase por ordem
    firebasePhotos.sort((a, b) => (a.order || 0) - (b.order || 0));
    
    // Se houver fotos no Firebase, usamos elas. Caso contrário, usamos as locais.
    if (firebasePhotos.length > 0) {
      logger.log(`📸 Carregadas ${firebasePhotos.length} fotos do Firebase`);
      return firebasePhotos;
    }
    
    logger.log('🏠 Nenhuma foto no Firebase, usando fotos locais de fallback');
    return LOCAL_PHOTOS;
  } catch (error) {
    logger.error('Erro ao buscar fotos do Firebase, tentando locais:', error);
    return LOCAL_PHOTOS;
  }
};

/**
 * Busca fotos com paginação
 * @param {number} pageSize - Número de fotos por página (padrão: 10)
 * @param {Object} lastVisible - Último documento visível para continuar a paginação
 * @returns {Promise<Object>} { photos, lastVisible, hasMore }
 */
export const fetchPhotosPaginated = async (pageSize = 10, lastVisible = null) => {
  try {
    const photosRef = collection(db, PHOTOS_COLLECTION);
    let q = query(photosRef, orderBy('order'), limit(pageSize));
    
    if (lastVisible) {
      q = query(q, startAfter(lastVisible));
    }
    
    const snapshot = await getDocs(q);
    
    const firebasePhotos = [];
    snapshot.forEach((doc) => {
      firebasePhotos.push({ id: doc.id, ...doc.data(), isLocal: false });
    });
    
    const lastDoc = snapshot.docs[snapshot.docs.length - 1];
    const hasMore = !snapshot.empty && firebasePhotos.length === pageSize;
    
    return {
      photos: firebasePhotos,
      lastVisible: lastDoc,
      hasMore
    };
  } catch (error) {
    logger.error('Erro ao buscar fotos com paginação:', error);
    return {
      photos: LOCAL_PHOTOS,
      lastVisible: null,
      hasMore: false
    };
  }
};

/**
 * Busca uma foto específica por ID
 * @param {string} photoId - ID da foto
 * @returns {Promise<Object|null>} Foto ou null
 */
export const fetchPhotoById = async (photoId) => {
  try {
    const photoDoc = doc(db, PHOTOS_COLLECTION, photoId);
    const docSnapshot = await getDoc(photoDoc);
    
    if (docSnapshot.exists()) {
      return { id: docSnapshot.id, ...docSnapshot.data() };
    }
    
    return null;
  } catch (error) {
    logger.error('Erro ao buscar foto:', error);
    return null;
  }
};

/**
 * Salva uma nova foto no Firestore
 * @param {Object} photoData - Dados da foto { url, caption, date, order }
 * @returns {Promise<string|null>} ID da foto ou null
 */
export const savePhoto = async (photoData) => {
  try {
    const photosRef = collection(db, PHOTOS_COLLECTION);
    const docRef = await addDoc(photosRef, {
      ...photoData,
      createdAt: new Date().toISOString()
    });
    
    logger.log('✅ Foto salva no Firestore');
    return docRef.id;
  } catch (error) {
    logger.error('❌ Erro ao salvar foto:', error);
    return null;
  }
};

/**
 * Atualiza uma foto existente
 * @param {string} photoId - ID da foto
 * @param {Object} photoData - Dados atualizados
 * @returns {Promise<boolean>} True se atualizado com sucesso
 */
export const updatePhoto = async (photoId, photoData) => {
  try {
    const photoDoc = doc(db, PHOTOS_COLLECTION, photoId);
    await updateDoc(photoDoc, photoData);
    
    logger.log('✅ Foto atualizada no Firestore');
    return true;
  } catch (error) {
    logger.error('❌ Erro ao atualizar foto:', error);
    return false;
  }
};

/**
 * Remove uma foto do Firestore
 * @param {string} photoId - ID da foto
 * @returns {Promise<boolean>} True se removida com sucesso
 */
export const deletePhoto = async (photoId) => {
  try {
    const photoDoc = doc(db, PHOTOS_COLLECTION, photoId);
    await deleteDoc(photoDoc);
    
    logger.log('✅ Foto removida do Firestore');
    return true;
  } catch (error) {
    logger.error('❌ Erro ao remover foto:', error);
    return false;
  }
};

/**
 * Reordena as fotos
 * @param {Array} photos - Array de fotos com novas ordens
 * @returns {Promise<boolean>} True se reordenado com sucesso
 */
export const reorderPhotos = async (photos) => {
  try {
    const updatePromises = photos.map((photo, index) => {
      const photoDoc = doc(db, PHOTOS_COLLECTION, photo.id);
      return updateDoc(photoDoc, { order: index });
    });
    
    await Promise.all(updatePromises);
    
    logger.log('✅ Fotos reordenadas no Firestore');
    return true;
  } catch (error) {
    logger.error('❌ Erro ao reordenar fotos:', error);
    return false;
  }
};
