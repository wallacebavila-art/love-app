/**
 * Script para importar mensagens do dia para o Firebase Firestore
 * 
 * Uso:
 * node import-mensagens.js <arquivo_json>
 * 
 * Exemplo:
 * node import-mensagens.js mensagens.json
 * 
 * Cada mensagem recebe uma data sequencial começando de hoje (YYYY-MM-DD)
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Verificar argumento do arquivo JSON
const args = process.argv.slice(2);
if (args.length < 1) {
  console.log('❌ Uso incorreto!');
  console.log('Uso: node import-mensagens.js <arquivo_json>');
  console.log('Exemplo: node import-mensagens.js mensagens.json');
  process.exit(1);
}

const jsonFilePath = args[0];

// Ler o arquivo JSON
let mensagens;
try {
  const jsonContent = readFileSync(jsonFilePath, 'utf8');
  mensagens = JSON.parse(jsonContent);
  console.log(`📝 ${mensagens.length} mensagens encontradas no arquivo.`);
} catch (error) {
  console.error('❌ Erro ao ler o arquivo JSON:', error.message);
  process.exit(1);
}

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

// Importar para o Firestore
const db = admin.firestore();
const batch = db.batch();

let successCount = 0;
let errorCount = 0;

console.log('📤 Iniciando importação para o Firestore...');

// Começar de hoje
const today = new Date();

for (let i = 0; i < mensagens.length; i++) {
  try {
    // Calcular data: hoje + i dias
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`;
    
    const docRef = db.collection('mensagens').doc(dateKey);
    batch.set(docRef, { 
      mensagem: mensagens[i],
      date: dateKey
    });
    successCount++;
    
    // Executar batch a cada 500 operações (limite do Firestore)
    if (successCount % 500 === 0) {
      await batch.commit();
      console.log(`✅ ${successCount} mensagens importadas...`);
    }
  } catch (error) {
    errorCount++;
    console.error(`❌ Erro ao importar mensagem #${i + 1}:`, error.message);
  }
}

// Commit final do batch
if (successCount % 500 !== 0) {
  await batch.commit();
}

console.log('\n🎉 Importação concluída!');
console.log(`✅ Sucesso: ${successCount} mensagens`);
console.log(`❌ Erros: ${errorCount} mensagens`);
console.log(`📅 Datas: de hoje até +${successCount - 1} dias`);

// Mostrar as primeiras e últimas datas como exemplo
const firstDate = new Date(today);
const lastDate = new Date(today);
lastDate.setDate(today.getDate() + successCount - 1);

const fmt = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

console.log(`📆 Primeira data: ${fmt(firstDate)}`);
console.log(`📆 Última data: ${fmt(lastDate)}`);

process.exit(0);