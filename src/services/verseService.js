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
      // Versículo padrão se não houver versículo para hoje
      return {
        text: 'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.',
        reference: 'João 3:16'
      };
    }
  } catch (error) {
    console.error('Erro ao buscar versículo:', error);
    return {
      text: 'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.',
      reference: 'João 3:16'
    };
  }
};
