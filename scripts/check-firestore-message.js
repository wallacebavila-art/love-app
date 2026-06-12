/**
 * Script para verificar a mensagem do dia 12 no Firestore
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

async function checkMessage() {
  try {
    // Verificar documento 2026-06-12
    const dateDocRef = db.collection('mensagens').doc('2026-06-12');
    const doc = await dateDocRef.get();
    
    if (doc.exists) {
      const data = doc.data();
      console.log('✅ Documento 2026-06-12 existe');
      console.log('📝 Mensagem:', data.mensagem);
    } else {
      console.log('❌ Documento 2026-06-12 NÃO existe no Firestore');
    }

    // Listar todos os documentos na coleção mensagens
    console.log('\n📋 Todos os documentos na coleção mensagens:');
    const snapshot = await db.collection('mensagens').get();
    if (snapshot.empty) {
      console.log('❌ Nenhum documento encontrado na coleção mensagens');
    } else {
      snapshot.forEach(doc => {
        console.log(`📄 ID: ${doc.id} - Mensagem: ${doc.data().mensagem?.substring(0, 50)}...`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao verificar mensagem:', error.message);
    process.exit(1);
  }
}

checkMessage();
