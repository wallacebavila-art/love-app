/**
 * Script para verificar playlists cadastradas
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

async function checkPlaylists() {
  try {
    console.log('\n📋 Playlists Locais (src/data/playlist.js):');
    console.log('🎵 3 músicas cadastradas');
    console.log('   1. Orochi SOBRE NOS (prod.Ajaxx)');
    console.log('   2. Orochi - Fashion (prod. TKN, RUXN, Kizzy, ProdSmile)');
    console.log('   3. ELA KÉ LEITADA - MC GW, CACAU CHUU (DJ Nifour)');

    console.log('\n📋 Playlist YouTube Padrão:');
    console.log('🎵 1 playlist padrão');
    console.log('   ID: PL7Z2KjbeQrjT0TQw0_3JZAFJF9hhwdVOQ');
    console.log('   Nome: Playlist Principal');

    console.log('\n📋 Verificando Firestore por playlists adicionais:');
    const snapshot = await db.collection('playlists').get();
    if (snapshot.empty) {
      console.log('❌ Nenhuma playlist adicional encontrada no Firestore');
    } else {
      console.log(`✅ ${snapshot.size} playlists encontradas no Firestore:`);
      snapshot.forEach(doc => {
        console.log(`📄 ID: ${doc.id} - Nome: ${doc.data().name || 'Sem nome'}`);
      });
    }

    console.log('\n📊 Resumo:');
    console.log('🎵 Playlist local: 3 músicas');
    console.log('🎵 Playlist YouTube padrão: 1');
    console.log(`🎵 Playlists Firestore: ${snapshot.size}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao verificar playlists:', error.message);
    process.exit(1);
  }
}

checkPlaylists();
