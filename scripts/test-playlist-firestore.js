/**
 * Script para testar se as playlists estão funcionando no Firestore
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

async function testPlaylists() {
  try {
    console.log('\n📋 Verificando playlists no Firestore:');
    const snapshot = await db.collection('playlists').get();
    if (snapshot.empty) {
      console.log('❌ Nenhuma playlist encontrada no Firestore');
    } else {
      console.log(`✅ ${snapshot.size} playlists encontradas no Firestore:`);
      snapshot.forEach(doc => {
        const data = doc.data();
        console.log(`📄 Firestore ID: ${doc.id}`);
        console.log(`   Playlist ID: ${data.id}`);
        console.log(`   Nome: ${data.name}`);
        console.log(`   Descrição: ${data.description}`);
        console.log(`   Criado em: ${data.createdAt?.toDate() || 'N/A'}`);
        console.log('');
      });
    }

    console.log('🎉 Teste concluído!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao testar playlists:', error.message);
    process.exit(1);
  }
}

testPlaylists();
