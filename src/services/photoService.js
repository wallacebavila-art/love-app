import { db } from './firebaseConfig';
import { doc, getDoc, collection, getDocs, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';

const PHOTOS_COLLECTION = 'photos';

/**
 * Busca todas as fotos do Firestore
 * @returns {Promise<Array>} Array de fotos
 */
export const fetchAllPhotos = async () => {
  try {
    const photosRef = collection(db, PHOTOS_COLLECTION);
    const snapshot = await getDocs(photosRef);
    
    const photos = [];
    snapshot.forEach((doc) => {
      photos.push({ id: doc.id, ...doc.data() });
    });
    
    // Ordenar por ordem
    photos.sort((a, b) => (a.order || 0) - (b.order || 0));
    
    return photos;
  } catch (error) {
    console.error('Erro ao buscar fotos:', error);
    return [];
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
    console.error('Erro ao buscar foto:', error);
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
    
    console.log('✅ Foto salva no Firestore');
    return docRef.id;
  } catch (error) {
    console.error('❌ Erro ao salvar foto:', error);
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
    
    console.log('✅ Foto atualizada no Firestore');
    return true;
  } catch (error) {
    console.error('❌ Erro ao atualizar foto:', error);
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
    
    console.log('✅ Foto removida do Firestore');
    return true;
  } catch (error) {
    console.error('❌ Erro ao remover foto:', error);
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
    
    console.log('✅ Fotos reordenadas no Firestore');
    return true;
  } catch (error) {
    console.error('❌ Erro ao reordenar fotos:', error);
    return false;
  }
};
