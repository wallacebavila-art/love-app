/**
 * Script para verificar documentos temporários no Firestore
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

async function checkTempDocs() {
  try {
    // Verificar documento temp-0 na coleção mensagens
    console.log('\n📋 Verificando documento temp-0 na coleção mensagens:');
    const tempMsgDoc = await db.collection('mensagens').doc('temp-0').get();
    if (tempMsgDoc.exists) {
      console.log('✅ Documento temp-0 existe em mensagens');
      console.log('📝 Conteúdo:', tempMsgDoc.data());
    } else {
      console.log('❌ Documento temp-0 NÃO existe em mensagens');
    }

    // Verificar documento temp-0 na coleção verses
    console.log('\n📋 Verificando documento temp-0 na coleção verses:');
    const tempVerseDoc = await db.collection('verses').doc('temp-0').get();
    if (tempVerseDoc.exists) {
      console.log('✅ Documento temp-0 existe em verses');
      console.log('📝 Conteúdo:', tempVerseDoc.data());
    } else {
      console.log('❌ Documento temp-0 NÃO existe em verses');
    }

    // Listar todos os documentos que começam com "temp"
    console.log('\n📋 Todos os documentos que começam com "temp" na coleção mensagens:');
    const snapshot = await db.collection('mensagens').where('__name__', '>=', 'temp').where('__name__', '<', 'temq').get();
    if (snapshot.empty) {
      console.log('❌ Nenhum documento encontrado começando com "temp"');
    } else {
      snapshot.forEach(doc => {
        console.log(`📄 ID: ${doc.id} - Conteúdo:`, doc.data());
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao verificar documentos temporários:', error.message);
    process.exit(1);
  }
}

checkTempDocs();
