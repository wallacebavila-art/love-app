import { logger } from '../utils/logger';
import { db } from './firebaseConfig';
import { doc, setDoc, getDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';

const TOKENS_COLLECTION = 'fcm_tokens';

/**
 * Salva o token FCM no Firestore
 * @param {string} token - Token FCM do dispositivo
 * @param {string} userId - ID do usuário (opcional, usa token como ID se não fornecido)
 */
export const saveFCMToken = async (token, userId = null) => {
  try {
    const tokenId = userId || token;
    const tokenRef = doc(db, TOKENS_COLLECTION, tokenId);
    
    await setDoc(tokenRef, {
      token: token,
      userId: userId || token,
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
    });
    
    logger.log('✅ Token FCM salvo no Firestore');
    return true;
  } catch (error) {
    logger.error('❌ Erro ao salvar token FCM:', error);
    return false;
  }
};

/**
 * Busca todos os tokens FCM salvos no Firestore
 * @returns {Promise<Array>} Array de tokens
 */
export const getAllFCMTokens = async () => {
  try {
    const tokensRef = collection(db, TOKENS_COLLECTION);
    const snapshot = await getDocs(tokensRef);
    
    const tokens = [];
    snapshot.forEach((doc) => {
      tokens.push(doc.data().token);
    });
    
    logger.log(`✅ ${tokens.length} tokens encontrados`);
    return tokens;
  } catch (error) {
    logger.error('❌ Erro ao buscar tokens FCM:', error);
    return [];
  }
};

/**
 * Remove um token FCM do Firestore
 * @param {string} token - Token FCM a ser removido
 */
export const removeFCMToken = async (token) => {
  try {
    const tokenRef = doc(db, TOKENS_COLLECTION, token);
    await deleteDoc(tokenRef);
    logger.log('✅ Token FCM removido do Firestore');
    return true;
  } catch (error) {
    logger.error('❌ Erro ao remover token FCM:', error);
    return false;
  }
};

/**
 * Atualiza a data de último uso do token
 * @param {string} token - Token FCM
 */
export const updateTokenLastUsed = async (token) => {
  try {
    const tokenRef = doc(db, TOKENS_COLLECTION, token);
    await setDoc(tokenRef, {
      lastUsed: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    logger.error('❌ Erro ao atualizar último uso do token:', error);
  }
};
