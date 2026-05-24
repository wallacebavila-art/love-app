import { db } from './firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

export const fetchDailyVerse = async () => {
  try {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const dateKey = `${year}-${month}-${day}`;

    const verseDoc = await doc(db, 'verses', dateKey);
    const verseSnapshot = await getDoc(verseDoc);

    if (verseSnapshot.exists()) {
      return verseSnapshot.data();
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
