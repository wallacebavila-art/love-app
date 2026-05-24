import { initializeApp } from 'firebase/app';
import { getFirestore, setDoc, doc } from 'firebase/firestore';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const firebaseConfig = {
  apiKey: "AIzaSyBPpMEAe3yMYl8Y49btaV4lUiZLN_ZQEBo",
  authDomain: "para-raissa.firebaseapp.com",
  projectId: "para-raissa",
  storageBucket: "para-raissa.firebasestorage.app",
  messagingSenderId: "372214287601",
  appId: "1:372214287601:web:75eb749127035cb7d9ad50"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const importVersos = async () => {
  const versosPath = path.join(__dirname, 'versos_extraidos.json');
  const versosData = await fs.readFile(versosPath, 'utf8');
  const versos = JSON.parse(versosData);

  console.log(`Iniciando importação de ${versos.length} versículos...`);
  console.log('');

  const startDate = new Date(); // Começa hoje

  for (let i = 0; i < versos.length; i++) {
    const verso = versos[i];
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    const dateKey = formatDate(currentDate);

    try {
      const docRef = doc(db, 'verses', dateKey);
      await setDoc(docRef, {
        date: dateKey,
        text: verso.text,
        reference: verso.reference
      });
      console.log(`✅ ${dateKey} - ${verso.reference}`);
    } catch (error) {
      console.error(`❌ Erro ao importar ${dateKey}:`, error.message);
    }
  }

  console.log('');
  console.log('Importação concluída!');
};

importVersos().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Erro na importação:', error);
  process.exit(1);
});

