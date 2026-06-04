import { logger } from '../utils/logger';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

/**
 * Apaga todas as mensagens do Firestore
 * @returns {Promise<boolean>} True se apagado com sucesso
 */
export const clearAllMessages = async () => {
  try {
    logger.log('🗑️ Iniciando limpeza de todas as mensagens...');
    
    // Buscar todos os documentos da coleção 'mensagens'
    const messagesRef = collection(db, 'mensagens');
    const snapshot = await getDocs(messagesRef);
    
    if (snapshot.empty) {
      logger.log('✅ Nenhuma mensagem encontrada para apagar.');
      return true;
    }
    
    // Apagar cada documento
    const deletePromises = [];
    snapshot.forEach((docSnapshot) => {
      const docRef = doc(db, 'mensagens', docSnapshot.id);
      deletePromises.push(deleteDoc(docRef));
      logger.log(`🗑️ Apagando mensagem: ${docSnapshot.id}`);
    });
    
    await Promise.all(deletePromises);
    
    logger.log(`✅ ${snapshot.size} mensagens apagadas com sucesso!`);
    return true;
  } catch (error) {
    logger.error('❌ Erro ao apagar mensagens:', error);
    return false;
  }
};
