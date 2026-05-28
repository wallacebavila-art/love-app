import { db, storage, auth } from './firebaseConfig';
import { doc, getDoc, collection, getDocs, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage';

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
    console.log('📸 Iniciando upload da foto:', file.name, 'Tamanho original:', (file.size / 1024 / 1024).toFixed(2), 'MB');

    // Verificar se é HEIC e alertar para converter manualmente
    if (file.name.toLowerCase().endsWith('.heic') || file.type === 'image/heic') {
      throw new Error('Arquivos HEIC não são suportados. Por favor, converta a imagem para JPEG ou PNG antes de fazer upload.');
    }

    // Comprimir imagem antes do upload (melhor qualidade: 500KB, qualidade 0.9)
    const compressedBlob = await compressImage(file, 1920, 1080, 0.9, 500);

    // Criar novo nome de arquivo com extensão .webp
    const webpFileName = fileName.replace(/\.[^/.]+$/, '') + '.webp';

    const storageRef = ref(storage, `photos/${webpFileName}`);
    const snapshot = await uploadBytes(storageRef, compressedBlob);
    const downloadURL = await getDownloadURL(snapshot.ref);

    console.log('✅ Upload concluído:', downloadURL);
    return downloadURL;
  } catch (error) {
    console.error('Erro ao fazer upload da foto:', error);
    return null;
  }
};

/**
 * Faz upload de um áudio para o Firebase Storage
 * @param {File} file - Arquivo de áudio
 * @param {string} fileName - Nome do arquivo
 * @returns {Promise<string>} URL do áudio ou null
 */
export const uploadAudioToStorage = async (file, fileName) => {
  try {
    console.log('🎤 Iniciando upload do áudio:', file.name, 'Tamanho:', (file.size / 1024).toFixed(2), 'KB');

    // Verificar se é arquivo de áudio
    if (!file.type.startsWith('audio/')) {
      throw new Error('O arquivo deve ser um áudio (MP3, WAV, M4A, etc.)');
    }

    // Limitar tamanho do áudio (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('O áudio é muito grande. Máximo permitido: 10MB');
    }

    const storageRef = ref(storage, `audio/${fileName}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    console.log('✅ Upload de áudio concluído:', downloadURL);
    return downloadURL;
  } catch (error) {
    console.error('Erro ao fazer upload do áudio:', error);
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
 * Faz upload para Google Drive via Google Apps Script
 * O script salva a URL diretamente no Firestore, contornando o problema do no-cors
 * @param {File} file - Arquivo de imagem
 * @param {Object} photoData - Dados da foto { caption, order }
 * @returns {Promise<boolean>} True se enviado com sucesso
 */
export const uploadToGoogleDrive = async (file, photoData) => {
  try {
    console.log('📤 Tentando upload para Google Drive:', file.name);
    
    // Converter arquivo para base64
    const reader = new FileReader();
    const base64Promise = new Promise((resolve, reject) => {
      reader.onload = () => {
        const result = reader.result;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    
    const base64Data = await base64Promise;
    
    // Substitua pela URL do seu Google Apps Script deployado
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxHtX__KBc7VaMrmNtetLKzc-FVnsUJJ7khXJ3ar59II6rW3lHPfmgy-V6c2bqx2yeWRQ/exec';
    
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors', // Necessário para evitar CORS com Google Apps Script
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: base64Data,
        fileName: file.name,
        mimeType: file.type,
        caption: photoData.caption || '',
        order: photoData.order || 0
      })
    });
    
    // Como usamos no-cors, não podemos ler a resposta diretamente
    // Mas o script salva no Firestore automaticamente
    console.log('✅ Upload para Google Drive enviado (script salva no Firestore automaticamente)');
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao fazer upload para Google Drive:', error);
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
 * Comprime e redimensiona imagem usando Canvas
 * @param {File} file - Arquivo de imagem
 * @param {number} maxWidth - Largura máxima (padrão: 1920)
 * @param {number} maxHeight - Altura máxima (padrão: 1080)
 * @param {number} quality - Qualidade (0-1, padrão: 0.8)
 * @param {number} maxSizeKB - Tamanho máximo em KB (padrão: 300)
 * @returns {Promise<Blob>} Blob comprimido
 */
export const compressImage = (file, maxWidth = 1920, maxHeight = 1080, quality = 0.8, maxSizeKB = 300) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calcular novas dimensões mantendo proporção
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = width * ratio;
            height = height * ratio;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Função recursiva para ajustar qualidade até atingir tamanho máximo
          const compressWithQuality = (currentQuality) => {
            canvas.toBlob((blob) => {
              if (!blob) {
                reject(new Error('Erro ao comprimir imagem'));
                return;
              }

              const sizeKB = blob.size / 1024;

              // Se o tamanho for aceitável ou a qualidade for muito baixa
              if (sizeKB <= maxSizeKB || currentQuality <= 0.1) {
                console.log(`📸 Imagem comprimida: ${(blob.size / 1024).toFixed(2)}KB (qualidade: ${currentQuality})`);
                resolve(blob);
              } else {
                // Reduzir qualidade e tentar novamente
                compressWithQuality(currentQuality - 0.1);
              }
            }, 'image/webp', currentQuality);
          };

          compressWithQuality(quality);
        } catch (error) {
          reject(new Error(`Erro ao processar imagem ${file.name}: ${error.message}`));
        }
      };
      img.onerror = () => {
        reject(new Error(`Erro ao carregar imagem ${file.name}: formato não suportado ou arquivo corrompido`));
      };
      img.src = e.target.result;
    };
    reader.onerror = () => {
      reject(new Error(`Erro ao ler arquivo ${file.name}`));
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Converte arquivo para base64
 * @param {File} file - Arquivo de imagem
 * @returns {Promise<string>} String base64
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Obtém estatísticas de uso do Firebase Storage
 * @returns {Promise<Object>} Estatísticas de uso detalhadas
 */
export const getStorageStats = async () => {
  try {
    const photosRef = ref(storage, 'photos');
    const result = await listAll(photosRef);

    let totalSize = 0;
    const fileCount = result.items.length;
    const fileNames = [];

    // Obter metadados de cada arquivo para calcular o tamanho total
    for (const itemRef of result.items) {
      try {
        fileNames.push(itemRef.name);
        // Infelizmente o SDK do cliente não fornece metadados de tamanho sem fazer download
        // Vamos estimar baseado no número de arquivos (assumindo ~500KB por foto)
        totalSize += 500 * 1024; // 500KB estimado por foto
      } catch (error) {
        console.error('Erro ao obter metadados do arquivo:', error);
      }
    }

    const totalSizeInMB = totalSize / (1024 * 1024);
    const totalSizeInGB = totalSizeInMB / 1024;
    const freeLimitGB = 5;
    const usagePercentage = ((totalSizeInGB / freeLimitGB) * 100).toFixed(1);

    return {
      totalSize,
      fileCount,
      totalSizeInMB: totalSizeInMB.toFixed(2),
      totalSizeInGB: totalSizeInGB.toFixed(4),
      freeLimitGB,
      usagePercentage,
      remainingGB: (freeLimitGB - totalSizeInGB).toFixed(4),
      // Limites do plano gratuito
      limits: {
        storage: {
          used: totalSizeInGB,
          limit: freeLimitGB,
          remaining: freeLimitGB - totalSizeInGB,
          percentage: usagePercentage
        },
        download: {
          limit: 1, // 1GB por dia
          used: (totalSizeInGB * 0.1).toFixed(2), // Estimativa
          remaining: (1 - (totalSizeInGB * 0.1)).toFixed(2)
        },
        operations: {
          read: {
            limit: 50000,
            used: fileCount * 10, // Estimativa
            remaining: 50000 - (fileCount * 10)
          },
          write: {
            limit: 20000,
            used: fileCount * 2, // Estimativa
            remaining: 20000 - (fileCount * 2)
          }
        }
      },
      files: fileNames
    };
  } catch (error) {
    console.error('Erro ao obter estatísticas do Storage:', error);
    return {
      totalSize: 0,
      fileCount: 0,
      totalSizeInMB: '0.00',
      totalSizeInGB: '0.0000',
      freeLimitGB: 5,
      usagePercentage: '0.0',
      remainingGB: '5.0000',
      limits: {
        storage: { used: 0, limit: 5, remaining: 5, percentage: '0.0' },
        download: { limit: 1, used: 0, remaining: 1 },
        operations: {
          read: { limit: 50000, used: 0, remaining: 50000 },
          write: { limit: 20000, used: 0, remaining: 20000 }
        }
      },
      files: []
    };
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
    console.log('📸 Iniciando upload da foto:', file.name, 'Tamanho original:', (file.size / 1024 / 1024).toFixed(2), 'MB');

    // Verificar se é HEIC e alertar para converter manualmente
    if (file.name.toLowerCase().endsWith('.heic') || file.type === 'image/heic') {
      throw new Error('Arquivos HEIC não são suportados. Por favor, converta a imagem para JPEG ou PNG antes de fazer upload.');
    }

    // Comprimir imagem antes de converter para base64
    const compressedBase64 = await compressImage(file, 1024, 0.7);

    // Verificar tamanho comprimido (Firestore limite é 1MB por documento)
    const sizeInMB = (compressedBase64.length * 0.75) / (1024 * 1024); // aprox
    console.log('✅ Imagem comprimida, tamanho:', sizeInMB.toFixed(2), 'MB');

    if (sizeInMB > 0.9) {
      alert('A imagem comprimida ainda é muito grande. Tente uma imagem menor ou reduza a qualidade.');
      return null;
    }

    // Salvar diretamente no Firestore
    const photosRef = collection(db, PHOTOS_COLLECTION);
    const docRef = await addDoc(photosRef, {
      url: compressedBase64,
      caption: photoData.caption || '',
      order: photoData.order || 0,
      createdAt: new Date().toISOString(),
      isBase64: true
    });

    console.log('✅ Foto salva no Firestore (base64 comprimido), ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Erro ao salvar foto com upload:', error);
    alert('Erro ao fazer upload da foto: ' + error.message);
    return null;
  }
};
