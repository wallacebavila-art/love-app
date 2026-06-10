/**
 * Script simples para remanejar as datas das mensagens ou versículos no Firebase Firestore
 * Este script apenas atualiza as datas dos documentos existentes sem deletar e recriar
 * 
 * Uso:
 * node reschedule-simple.js <nova_data_inicio> <colecao> [--confirm]
 * 
 * Exemplos:
 * node reschedule-simple.js 2026-06-12 mensagens
 * node reschedule-simple.js 2026-06-12 verses
 * node reschedule-simple.js 2026-06-12 verses --confirm
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

// Verificar argumentos
const args = process.argv.slice(2);
if (args.length < 2) {
  console.log('❌ Uso incorreto!');
  console.log('Uso: node reschedule-simple.js <nova_data_inicio> <colecao> [--confirm]');
  console.log('Exemplo: node reschedule-simple.js 2026-06-12 mensagens');
  console.log('Coleções disponíveis: mensagens, verses');
  console.log('Formato da data: YYYY-MM-DD');
  process.exit(1);
}

const newStartDateStr = args[0];
const collectionName = args[1];

// Validar nome da coleção
if (collectionName !== 'mensagens' && collectionName !== 'verses') {
  console.log('❌ Coleção inválida!');
  console.log('Coleções disponíveis: mensagens, verses');
  process.exit(1);
}

// Validar formato da data
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
if (!dateRegex.test(newStartDateStr)) {
  console.log('❌ Formato de data inválido!');
  console.log('Use o formato: YYYY-MM-DD');
  console.log('Exemplo: 2024-07-12');
  process.exit(1);
}

const newStartDate = new Date(newStartDateStr);
if (isNaN(newStartDate.getTime())) {
  console.log('❌ Data inválida!');
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

// Função para formatar data
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Função principal para remanejar mensagens
const rescheduleMessages = async () => {
  try {
    const db = admin.firestore();
    
    // Buscar todos os documentos ordenados por data
    console.log(`📖 Buscando documentos da coleção '${collectionName}' do Firestore...`);
    const snapshot = await db.collection(collectionName).orderBy('date').get();
    
    if (snapshot.empty) {
      console.log('📭 Nenhum documento encontrado.');
      return;
    }
    
    console.log(`📝 ${snapshot.size} documentos encontrados.`);
    
    // Obter a primeira data atual
    const documents = [];
    snapshot.forEach((doc) => {
      documents.push({
        id: doc.id,
        data: doc.data()
      });
    });
    
    const currentStartDate = new Date(documents[0].data.date);
    console.log(`📅 Data atual de início: ${formatDate(currentStartDate)}`);
    console.log(`📅 Nova data de início: ${formatDate(newStartDate)}`);
    
    // Confirmar operação
    console.log('\n⚠️ Este script vai atualizar as datas de todos os documentos.');
    console.log(`📝 ${documents.length} documentos serão atualizados.`);
    console.log(`📅 De ${formatDate(currentStartDate)} para ${formatDate(newStartDate)}`);
    console.log('\nPara continuar, execute o script novamente com a flag --confirm');
    console.log(`Exemplo: node reschedule-simple.js ${newStartDateStr} ${collectionName} --confirm`);
    
    // Verificar flag de confirmação
    const confirmIndex = process.argv.indexOf('--confirm');
    if (confirmIndex === -1) {
      console.log('\n❌ Operação cancelada. Use --confirm para executar.');
      process.exit(0);
    }
    
    // Atualizar documentos
    console.log('\n📤 Iniciando atualização dos documentos...');
    
    let updateCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i];
      try {
        // Calcular nova data usando o índice (garante que o primeiro seja exatamente a data fornecida)
        const newDate = new Date(newStartDateStr + 'T12:00:00Z'); // Usar UTC noon para evitar problemas de fuso horário
        newDate.setUTCDate(newDate.getUTCDate() + i);
        const finalDateKey = formatDate(newDate);
        
        console.log(`📝 ${doc.id} (${doc.data.date}) -> ${finalDateKey} (índice ${i})`);
        
        // Atualizar o documento existente com a nova data
        const docRef = db.collection(collectionName).doc(doc.id);
        await docRef.update({ date: finalDateKey });
        
        updateCount++;
      } catch (error) {
        errorCount++;
        console.error(`❌ Erro ao processar documento ${doc.id}:`, error.message);
      }
    }
    
    console.log('\n🎉 Remanejamento concluído!');
    console.log(`✅ Sucesso: ${updateCount} documentos`);
    console.log(`❌ Erros: ${errorCount} documentos`);
    console.log(`📅 Nova data de início: ${formatDate(newStartDate)}`);
    
  } catch (error) {
    console.error('❌ Erro ao remanejar documentos:', error);
    process.exit(1);
  }
};

rescheduleMessages().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Erro no script:', error);
  process.exit(1);
});
