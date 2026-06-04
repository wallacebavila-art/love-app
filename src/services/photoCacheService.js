import { compressImage } from './photoStorageService';
import { savePhoto } from './photoMetadataService';
import { logger } from '../utils/logger';

/**
 * Salva uma nova foto com upload para o Storage
 * @param {File} file - Arquivo de imagem
 * @param {Object} photoData - Dados da foto { caption, order }
 * @returns {Promise<string|null>} ID da foto ou null
 */
export const savePhotoWithUpload = async (file, photoData) => {
  try {
    logger.log('📸 Iniciando upload da foto:', file.name, 'Tamanho original:', (file.size / 1024 / 1024).toFixed(2), 'MB');

    // Verificar se é HEIC e alertar para converter manualmente
    if (file.name.toLowerCase().endsWith('.heic') || file.type === 'image/heic') {
      throw new Error('Arquivos HEIC não são suportados. Por favor, converta a imagem para JPEG ou PNG antes de fazer upload.');
    }

    // Comprimir imagem antes de converter para base64
    const compressedBase64 = await compressImage(file, 1024, 0.7);

    // Verificar tamanho comprimido (Firestore limite é 1MB por documento)
    const sizeInMB = (compressedBase64.length * 0.75) / (1024 * 1024); // aprox
    logger.log('✅ Imagem comprimida, tamanho:', sizeInMB.toFixed(2), 'MB');

    if (sizeInMB > 0.9) {
      throw new Error('A imagem comprimida ainda é muito grande. Tente uma imagem menor ou reduza a qualidade.');
    }

    // Salvar diretamente no Firestore
    const photoDataWithUrl = {
      url: compressedBase64,
      caption: photoData.caption || '',
      order: photoData.order || 0,
      isBase64: true
    };

    const photoId = await savePhoto(photoDataWithUrl);

    logger.log('✅ Foto salva no Firestore (base64 comprimido), ID:', photoId);
    return photoId;
  } catch (error) {
    logger.error('❌ Erro ao salvar foto com upload:', error);
    throw new Error('Erro ao fazer upload da foto: ' + error.message);
  }
};
