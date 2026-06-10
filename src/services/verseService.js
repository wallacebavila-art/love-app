import { db } from './firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { getMessageDateString } from '../utils/dateUtils';

export const fetchDailyVerse = async () => {
  try {
    const dateKey = getMessageDateString();
    
    // Se a data for null (antes da data de início), retorna versículo padrão
    if (!dateKey) {
      return {
        text: 'Pensando...',
        reference: ''
      };
    }

    const verseDoc = await doc(db, 'verses', dateKey);
    const verseSnapshot = await getDoc(verseDoc);

    if (verseSnapshot.exists()) {
      const data = verseSnapshot.data();
      // Transformar versículo para o formato esperado se necessário
      if (data.mensagem && !data.text) {
        const parts = data.mensagem.split(' - ');
        if (parts.length >= 2) {
          return {
            text: parts.slice(0, -1).join(' - '),
            reference: parts[parts.length - 1]
          };
        } else {
          return {
            text: data.mensagem,
            reference: ''
          };
        }
      }
      return data;
    } else {
      return {
        text: 'Pensando...',
        reference: ''
      };
    }
  } catch (error) {
    console.error('Erro ao buscar versículo:', error);
    return {
      text: 'Pensando...',
      reference: ''
    };
  }
};
