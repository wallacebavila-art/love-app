/**
 * Script para verificar a primeira data com mensagem cadastrada no Firebase Firestore
 * 
 * Uso:
 * node check-first-message.js
 * 
 * PRÉ-REQUISITOS:
 * 1. npm install firebase-admin
 * 2. Baixar o arquivo de credenciais do Service Account do Firebase
 * 3. Renomear o arquivo JSON para 'service-account-key.json' e colocar na raiz do projeto
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
  console.log('\nPara configurar as credenciais:');
  console.log('1. Vá ao Firebase Console > Project Settings > Service Accounts');
  console.log('2. Clique em "Generate New Private Key"');
  console.log('3. Salve o arquivo JSON');
  console.log('4. Renomeie para "service-account-key.json" e coloque na raiz do projeto');
  process.exit(1);
}

// Função para verificar a primeira mensagem
const checkFirstMessage = async () => {
  try {
    const db = admin.firestore();
    
    console.log('📖 Buscando primeira mensagem do Firestore...');
    
    // Buscar a primeira mensagem ordenada por data
    const snapshot = await db.collection('mensagens').orderBy('date').limit(1).get();
    
    if (snapshot.empty) {
      console.log('📭 Nenhuma mensagem encontrada.');
      return;
    }
    
    const doc = snapshot.docs[0];
    const data = doc.data();
    
    console.log('\n📅 Primeira mensagem encontrada:');
    console.log(`📆 Data: ${data.date}`);
    console.log(`📝 Mensagem: ${data.mensagem.substring(0, 100)}${data.mensagem.length > 100 ? '...' : ''}`);
    console.log(`🆔 ID do documento: ${doc.id}`);
    
    // Buscar também a última mensagem
    const lastSnapshot = await db.collection('mensagens').orderBy('date', 'desc').limit(1).get();
    
    if (!lastSnapshot.empty) {
      const lastDoc = lastSnapshot.docs[0];
      const lastData = lastDoc.data();
      
      console.log('\n📅 Última mensagem encontrada:');
      console.log(`📆 Data: ${lastData.date}`);
      console.log(`🆔 ID do documento: ${lastDoc.id}`);
      
      // Calcular total de mensagens
      const countSnapshot = await db.collection('mensagens').count().get();
      console.log(`\n📊 Total de mensagens: ${countSnapshot.data().count}`);
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar mensagens:', error);
    process.exit(1);
  }
};

checkFirstMessage().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Erro no script:', error);
  process.exit(1);
});
