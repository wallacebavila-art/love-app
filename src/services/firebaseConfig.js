import { initializeApp } from 'firebase/app';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import { getMessaging } from 'firebase/messaging';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';
import { FIREBASE_CONFIG } from '../constants/appConfig';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: FIREBASE_CONFIG.apiKey,
  authDomain: FIREBASE_CONFIG.authDomain,
  projectId: FIREBASE_CONFIG.projectId,
  storageBucket: FIREBASE_CONFIG.storageBucket,
  messagingSenderId: FIREBASE_CONFIG.messagingSenderId,
  appId: FIREBASE_CONFIG.appId,
  databaseURL: FIREBASE_CONFIG.databaseURL
};

// Inicializar o Firebase
const app = initializeApp(firebaseConfig);

// Inicializar o Firestore com cache offline habilitado
const db = initializeFirestore(app, {
  cacheSizeBytes: 10 * 1024 * 1024, // 10MB
  experimentalForceLongPolling: false,
});

const messaging = getMessaging(app);
const auth = getAuth(app);
const storage = getStorage(app);
const rtdb = getDatabase(app);

export { db, messaging, auth, storage, rtdb };
export default app;
