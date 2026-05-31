/**
 * Script para limpar versículos antigos do Firebase Firestore
 * 
 * Uso:
 * node clear-old-verses.js
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
  const serviceAccountPath = join(__dirname, 'service-account-key.json');
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

// Limpar todos os documentos da coleção 'mensagens'
const clearMessages = async () => {
  try {
    const db = admin.firestore();
    const snapshot = await db.collection('mensagens').get();
    
    if (snapshot.empty) {
      console.log('📭 Nenhuma mensagem encontrada para limpar.');
      return;
    }
    
    console.log(`🗑️ Encontrados ${snapshot.size} documentos para limpar...`);
    
    const batch = db.batch();
    let deleteCount = 0;
    
    snapshot.forEach((doc) => {
      batch.delete(doc.ref);
      deleteCount++;
      
      // Executar batch a cada 500 operações
      if (deleteCount % 500 === 0) {
        batch.commit();
        console.log(`✅ ${deleteCount} documentos deletados...`);
      }
    });
    
    // Commit final do batch
    if (deleteCount % 500 !== 0) {
      await batch.commit();
    }
    
    console.log(`🎉 Limpeza concluída! ${deleteCount} documentos deletados.`);
    
  } catch (error) {
    console.error('❌ Erro ao limpar mensagens:', error);
    process.exit(1);
  }
};

clearMessages().then(() => {
  process.exit(0);
});