import { logger } from '../utils/logger';
import { db } from './firebaseConfig';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { getTodayDateString } from '../utils/dateUtils';

/**
 * Busca a mensagem do dia no Firestore
 * @returns {Promise<string|null>} A mensagem do dia ou null se não existir
 */
export const fetchDailyMessage = async () => {
  try {
    const today = getTodayDateString();
    const messageDoc = doc(db, 'mensagens', today);
    const docSnapshot = await getDoc(messageDoc);
    
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      return data.mensagem || 'Pensando...';
    }
    
    return 'Pensando...';
  } catch (error) {
    logger.error('Erro ao buscar mensagem do dia:', error);
    return 'Pensando...';
  }
};

/**
 * Busca uma mensagem de uma data específica
 * @param {string} dateKey - Data no formato YYYY-MM-DD
 * @returns {Promise<string|null>} A mensagem da data ou null se não existir
 */
export const fetchMessageByDate = async (dateKey) => {
  try {
    const messageDoc = doc(db, 'mensagens', dateKey);
    const docSnapshot = await getDoc(messageDoc);
    
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      return data.mensagem || null;
    }
    
    return null;
  } catch (error) {
    logger.error('Erro ao buscar mensagem da data:', error);
    return null;
  }
};

/**
 * Salva a mensagem do dia no Firestore
 * @param {string} message - A mensagem a ser salva
 * @returns {Promise<boolean>} True se salvo com sucesso
 */
export const saveDailyMessage = async (message) => {
  try {
    const today = getTodayDateString();
    const messageDoc = doc(db, 'mensagens', today);
    const docSnapshot = await getDoc(messageDoc);
    
    if (docSnapshot.exists()) {
      await updateDoc(messageDoc, { mensagem: message });
    } else {
      await setDoc(messageDoc, { mensagem: message });
    }
    
    logger.log('✅ Mensagem do dia salva no Firebase!');
    return true;
  } catch (error) {
    logger.error('❌ Erro ao salvar mensagem do dia:', error);
    return false;
  }
};

/**
 * Salva uma mensagem para uma data específica
 * @param {string} dateKey - Data no formato YYYY-MM-DD
 * @param {string} message - A mensagem a ser salva
 * @returns {Promise<boolean>} True se salvo com sucesso
 */
export const saveMessageByDate = async (dateKey, message) => {
  try {
    const messageDoc = doc(db, 'mensagens', dateKey);
    const docSnapshot = await getDoc(messageDoc);
    
    if (docSnapshot.exists()) {
      await updateDoc(messageDoc, { mensagem: message });
    } else {
      await setDoc(messageDoc, { mensagem: message });
    }
    
    logger.log(`✅ Mensagem salva para ${dateKey}!`);
    return true;
  } catch (error) {
    logger.error(`❌ Erro ao salvar mensagem para ${dateKey}:`, error);
    return false;
  }
};
