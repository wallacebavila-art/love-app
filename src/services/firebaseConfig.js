import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getMessaging } from 'firebase/messaging';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBPpMEAe3yMYl8Y49btaV4lUiZLN_ZQEBo",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "para-raissa.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "para-raissa",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "para-raissa.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "372214287601",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:372214287601:web:75eb749127035cb7d9ad50",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://para-raissa-default-rtdb.firebaseio.com"
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
