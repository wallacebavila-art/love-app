import { logger } from '../utils/logger';
import { db } from './firebaseConfig';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const TIMELINE_DOC_ID = 'journey_timeline';

/**
 * Carrega os dados da timeline do Firestore
 * @returns {Promise<Object>} Objeto com milestones e customDays
 */
export const fetchTimelineData = async () => {
  try {
    const timelineDoc = doc(db, 'timeline', TIMELINE_DOC_ID);
    const docSnapshot = await getDoc(timelineDoc);
    
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      return {
        milestones: data.milestones || [],
        customDays: data.customDays || null
      };
    }
    
    return null;
  } catch (error) {
    logger.error('Erro ao carregar dados da timeline:', error);
    return null;
  }
};

/**
 * Salva os marcos da timeline no Firestore
 * @param {Array} milestones - Array de marcos da timeline
 * @returns {Promise<boolean>} True se salvo com sucesso
 */
export const saveMilestones = async (milestones) => {
  try {
    const timelineDoc = doc(db, 'timeline', TIMELINE_DOC_ID);
    const docSnapshot = await getDoc(timelineDoc);
    
    if (docSnapshot.exists()) {
      await updateDoc(timelineDoc, { milestones });
    } else {
      await setDoc(timelineDoc, { milestones });
    }
    
    logger.log('✅ Marcos da timeline salvos no Firebase!');
    return true;
  } catch (error) {
    logger.error('❌ Erro ao salvar marcos da timeline:', error);
    return false;
  }
};

/**
 * Salva os dias personalizados no Firestore
 * @param {number} customDays - Número de dias personalizados
 * @returns {Promise<boolean>} True se salvo com sucesso
 */
export const saveCustomDays = async (customDays) => {
  try {
    const timelineDoc = doc(db, 'timeline', TIMELINE_DOC_ID);
    const docSnapshot = await getDoc(timelineDoc);
    
    if (docSnapshot.exists()) {
      await updateDoc(timelineDoc, { customDays });
    } else {
      await setDoc(timelineDoc, { customDays });
    }
    
    logger.log('✅ Dias personalizados salvos no Firebase!');
    return true;
  } catch (error) {
    logger.error('❌ Erro ao salvar dias personalizados:', error);
    return false;
  }
};

/**
 * Salva todos os dados da timeline de uma vez
 * @param {Object} data - Objeto com milestones e customDays
 * @returns {Promise<boolean>} True se salvo com sucesso
 */
export const saveTimelineData = async (data) => {
  try {
    const timelineDoc = doc(db, 'timeline', TIMELINE_DOC_ID);
    const docSnapshot = await getDoc(timelineDoc);
    
    if (docSnapshot.exists()) {
      await updateDoc(timelineDoc, data);
    } else {
      await setDoc(timelineDoc, data);
    }
    
    return true;
  } catch (error) {
    logger.error('Erro ao salvar dados da timeline:', error);
    return false;
  }
};
