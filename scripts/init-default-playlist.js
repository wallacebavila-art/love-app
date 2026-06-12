/**
 * Script para inicializar a playlist padrão no Firestore
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Inicializar o Firebase Admin SDK
try {
  const serviceAccountPath = join(__dirname, '..', 'service-account-key.json');
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('✅ Firebase Admin SDK inicializado com sucesso');
} catch (error) {
  console.error('❌ Erro ao inicializar Firebase Admin SDK:', error.message);
  process.exit(1);
}

const db = admin.firestore();

async function initDefaultPlaylist() {
  try {
    const defaultPlaylistId = 'PL7Z2KjbeQrjT0TQw0_3JZAFJF9hhwdVOQ';
    
    // Verificar se já existe
    const snapshot = await db.collection('playlists').where('id', '==', defaultPlaylistId).get();
    
    if (!snapshot.empty) {
      console.log('✅ Playlist padrão já existe no Firestore');
      snapshot.forEach(doc => {
        console.log(`📄 Firestore ID: ${doc.id}`);
        console.log(`   Playlist ID: ${doc.data().id}`);
        console.log(`   Nome: ${doc.data().name}`);
      });
    } else {
      // Criar playlist padrão
      const docRef = await db.collection('playlists').add({
        id: defaultPlaylistId,
        name: 'Playlist Principal',
        description: 'Nossa playlist principal',
        createdAt: new Date()
      });
      console.log('✅ Playlist padrão criada no Firestore');
      console.log(`📄 Firestore ID: ${docRef.id}`);
      console.log(`   Playlist ID: ${defaultPlaylistId}`);
      console.log(`   Nome: Playlist Principal`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao inicializar playlist padrão:', error.message);
    process.exit(1);
  }
}

initDefaultPlaylist();
