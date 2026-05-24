/**
 * Script para importar versículos bíblicos para o Firebase Firestore
 * 
 * Uso:
 * node import-verses.js <arquivo_json>
 * 
 * Exemplo:
 * node import-verses.js verses.json
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

// Verificar argumento do arquivo JSON
const args = process.argv.slice(2);
if (args.length < 1) {
  console.log('❌ Uso incorreto!');
  console.log('Uso: node import-verses.js <arquivo_json>');
  console.log('Exemplo: node import-verses.js verses.json');
  process.exit(1);
}

const jsonFilePath = args[0];

// Função para converter id_dia para data YYYY-MM-DD começando de hoje
const dayIdToDate = (dayId, startFromDate = null) => {
  const startDate = startFromDate ? new Date(startFromDate) : new Date();
  const date = new Date(startDate);
  date.setDate(startDate.getDate() + (dayId - 1)); // Adiciona dias-1 ao dia atual
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Função para transformar o formato dos versículos
const transformVerses = (verses) => {
  return verses.map((verse, index) => {
    const dayNumber = verse.id_dia || (index + 1);
    const date = dayIdToDate(dayNumber); // Começa de hoje por padrão
    
    return {
      date: date,
      mensagem: `${verse.versiculo_texto} - ${verse.versiculo_ref}`
    };
  });
};

// Ler e transformar o JSON
try {
  const jsonContent = readFileSync(jsonFilePath, 'utf8');
  const versesData = JSON.parse(jsonContent);
  
  console.log(`📖 ${versesData.length} versículos encontrados no arquivo.`);
  
  const transformedVerses = transformVerses(versesData);
  
  console.log('🔄 Versículos transformados para o formato Firebase:');
  console.log('Exemplo:', transformedVerses[0]);
  
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
  
  // Importar para o Firestore
  const db = admin.firestore();
  const batch = db.batch();
  
  let successCount = 0;
  let errorCount = 0;
  
  console.log('📤 Iniciando importação para o Firestore...');
  
  for (const verse of transformedVerses) {
    try {
      const docRef = db.collection('mensagens').doc(verse.date);
      batch.set(docRef, { mensagem: verse.mensagem });
      successCount++;
      
      // Executar batch a cada 500 operações (limite do Firestore)
      if (successCount % 500 === 0) {
        await batch.commit();
        console.log(`✅ ${successCount} versículos importados...`);
        // Criar novo batch para as próximas operações
        batch.delete(); // Limpar referências do batch anterior
      }
    } catch (error) {
      errorCount++;
      console.error(`❌ Erro ao processar versículo para ${verse.date}:`, error.message);
    }
  }
  
  // Commit final do batch
  if (successCount % 500 !== 0) {
    await batch.commit();
  }
  
  console.log('\n🎉 Importação concluída!');
  console.log(`✅ Sucesso: ${successCount} versículos`);
  console.log(`❌ Erros: ${errorCount} versículos`);
  
  process.exit(0);
  
} catch (error) {
  console.error('❌ Erro ao processar o arquivo JSON:', error.message);
  process.exit(1);
}