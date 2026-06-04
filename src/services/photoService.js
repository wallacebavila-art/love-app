// Re-exportar funções dos novos serviços para compatibilidade
export {
  fetchAllPhotos,
  fetchPhotosPaginated,
  fetchPhotoById,
  savePhoto,
  updatePhoto,
  deletePhoto,
  reorderPhotos
} from './photoMetadataService';

export {
  uploadPhotoToStorage,
  uploadAudioToStorage,
  deletePhotoFromStorage,
  getStorageStats,
  compressImage,
  fileToBase64,
  uploadToGoogleDrive,
  uploadToImgur
} from './photoStorageService';

export {
  savePhotoWithUpload
} from './photoCacheService';
