import { db, storage } from './firebaseConfig';
import { doc, getDoc, collection, getDocs, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

const PHOTOS_COLLECTION = 'photos';

// Fotos locais servidas da pasta public/photos/ como fallback
const LOCAL_PHOTOS = [
  { id: 'local-1', url: '/love-app/photos/foto1.jpg', caption: 'Nossas Memórias 💕', order: 0, isLocal: true },
  { id: 'local-2', url: '/love-app/photos/foto2.jpg', caption: 'Momentos Especiais ✨', order: 1, isLocal: true },
  { id: 'local-3', url: '/love-app/photos/foto3.jpg', caption: 'Juntos para Sempre 💑', order: 2, isLocal: true },
];

/**
 * Busca todas as fotos do Firestore com fallback para fotos locais
 * @returns {Promise<Array>} Array de fotos
 */
export const fetchAllPhotos = async () => {
  try {
    const photosRef = collection(db, PHOTOS_COLLECTION);
    const snapshot = await getDocs(photosRef);
    
    const firebasePhotos = [];
    snapshot.forEach((doc) => {
      firebasePhotos.push({ id: doc.id, ...doc.data(), isLocal: false });
    });
    
    // Ordenar fotos do Firebase por ordem
    firebasePhotos.sort((a, b) => (a.order || 0) - (b.order || 0));
    
    // Se houver fotos no Firebase, usamos elas. Caso contrário, usamos as locais.
    if (firebasePhotos.length > 0) {
      console.log(`📸 Carregadas ${firebasePhotos.length} fotos do Firebase`);
      return firebasePhotos;
    }
    
    console.log('🏠 Nenhuma foto no Firebase, usando fotos locais de fallback');
    return LOCAL_PHOTOS;
  } catch (error) {
    console.error('Erro ao buscar fotos do Firebase, tentando locais:', error);
    return LOCAL_PHOTOS;
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

/**
 * Faz upload de uma imagem para o Firebase Storage
 * @param {File} file - Arquivo de imagem
 * @param {string} fileName - Nome do arquivo
 * @returns {Promise<string>} URL da imagem ou null
 */
export const uploadPhotoToStorage = async (file, fileName) => {
  try {
    console.log('📤 Iniciando upload para Storage:', fileName);
    const storageRef = ref(storage, `photos/${fileName}`);
    console.log('📁 Storage ref criada:', storageRef.fullPath);
    
    const snapshot = await uploadBytes(storageRef, file);
    console.log('✅ Upload concluído, snapshot:', snapshot);
    
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('✅ Foto enviada para o Storage:', downloadURL);
    return downloadURL;
  } catch (error) {
    console.error('❌ Erro ao fazer upload da foto:', error);
    console.error('Detalhes do erro:', error.code, error.message);
    return null;
  }
};

/**
 * Remove uma imagem do Firebase Storage
 * @param {string} photoUrl - URL da foto
 * @returns {Promise<boolean>} True se removida com sucesso
 */
export const deletePhotoFromStorage = async (photoUrl) => {
  try {
    // Extrair o caminho da URL do Storage
    const storagePath = photoUrl.match(/\/o\/(.*?)\?/)?.[1]?.replace(/%2F/g, '/');
    
    if (storagePath) {
      const storageRef = ref(storage, storagePath);
      await deleteObject(storageRef);
      console.log('✅ Foto removida do Storage');
      return true;
    }
    
    console.warn('⚠️ Não foi possível extrair o caminho da URL');
    return false;
  } catch (error) {
    console.error('❌ Erro ao remover foto do Storage:', error);
    return false;
  }
};

/**
 * Faz upload para Imgur API (alternativa ao Firebase Storage)
 * @param {File} file - Arquivo de imagem
 * @returns {Promise<string|null>} URL da imagem ou null
 */
export const uploadToImgur = async (file) => {
  try {
    console.log('📤 Tentando upload para Imgur (fallback):', file.name);
    
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch('https://api.imgur.com/3/image', {
      method: 'POST',
      headers: {
        'Authorization': 'Client-ID 4d8e5b5e5f5f5f5'
      },
      body: formData
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Upload para Imgur concluído:', data.data.link);
      return data.data.link;
    } else {
      throw new Error('Erro no upload para Imgur');
    }
  } catch (error) {
    console.error('❌ Erro ao fazer upload para Imgur:', error);
    return null;
  }
};

/**
 * Salva uma nova foto com upload para o Storage
 * @param {File} file - Arquivo de imagem
 * @param {Object} photoData - Dados da foto { caption, order }
 * @returns {Promise<string|null>} ID da foto ou null
 */
export const savePhotoWithUpload = async (file, photoData) => {
  try {
    console.log('📸 Iniciando upload da foto:', file.name, 'Tamanho:', file.size);
    
    let downloadURL = null;
    
    // Tentar Firebase Storage primeiro
    try {
      const fileName = `${Date.now()}_${file.name}`;
      console.log('📝 Tentando Firebase Storage, nome:', fileName);
      downloadURL = await uploadPhotoToStorage(file, fileName);
      console.log('✅ Firebase Storage funcionou!');
    } catch (storageError) {
      console.warn('⚠️ Firebase Storage falhou (provavelmente CORS), tentando Imgur:', storageError);
      downloadURL = await uploadToImgur(file);
    }
    
    if (!downloadURL) {
      throw new Error('Falha no upload da imagem (Firebase Storage e Imgur falharam)');
    }
    
    console.log('✅ Upload concluído, URL:', downloadURL);
    
    // Salvar metadados no Firestore
    const photosRef = collection(db, PHOTOS_COLLECTION);
    const docRef = await addDoc(photosRef, {
      url: downloadURL,
      caption: photoData.caption || '',
      order: photoData.order || 0,
      createdAt: new Date().toISOString()
    });
    
    console.log('✅ Foto salva no Firestore, ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Erro ao salvar foto com upload:', error);
    alert('Erro ao fazer upload da foto: ' + error.message);
    return null;
  }
};
