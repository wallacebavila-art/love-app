import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getMessaging } from 'firebase/messaging';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBPpMEAe3yMYl8Y49btaV4lUiZLN_ZQEBo",
  authDomain: "para-raissa.firebaseapp.com",
  projectId: "para-raissa",
  storageBucket: "para-raissa.firebasestorage.app",
  messagingSenderId: "372214287601",
  appId: "1:372214287601:web:75eb749127035cb7d9ad50",
  databaseURL: "https://para-raissa-default-rtdb.firebaseio.com"
};

// Inicializar o Firebase
const app = initializeApp(firebaseConfig);

// Inicializar o Firestore
const db = getFirestore(app);
const messaging = getMessaging(app);
const auth = getAuth(app);
const storage = getStorage(app);
const rtdb = getDatabase(app);

export { db, messaging, auth, storage, rtdb };
export default app;
