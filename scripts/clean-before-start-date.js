import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serviceAccountPath = path.join(__dirname, '../service-account-key.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const START_DATE = '2026-06-12';

async function cleanBeforeStartDate() {
  console.log('🔍 Analisando dados do Firebase...');
  console.log(`📅 Data de início: ${START_DATE}`);
  console.log('');

  // Limpar mensagens antes da data de início
  console.log('📝 Analisando mensagens...');
  const messagesSnapshot = await db.collection('mensagens').get();
  let messagesToDelete = [];
  let messagesToKeep = [];

  messagesSnapshot.forEach((doc) => {
    const date = doc.id;
    if (date < START_DATE) {
      messagesToDelete.push(date);
    } else {
      messagesToKeep.push(date);
    }
  });

  console.log(`📊 Mensagens totais: ${messagesSnapshot.size}`);
  console.log(`❌ Mensagens para deletar (antes de ${START_DATE}): ${messagesToDelete.length}`);
  console.log(`✅ Mensagens para manter (a partir de ${START_DATE}): ${messagesToKeep.length}`);

  if (messagesToDelete.length > 0) {
    console.log('🗑️ Deletando mensagens...');
    for (const date of messagesToDelete) {
      await db.collection('mensagens').doc(date).delete();
      console.log(`   ❌ Deletado: ${date}`);
    }
    console.log('✅ Mensagens deletadas com sucesso!');
  } else {
    console.log('✅ Nenhuma mensagem para deletar.');
  }

  console.log('');

  // Limpar versículos antes da data de início
  console.log('📖 Analisando versículos...');
  const versesSnapshot = await db.collection('verses').get();
  let versesToDelete = [];
  let versesToKeep = [];

  versesSnapshot.forEach((doc) => {
    const date = doc.id;
    if (date < START_DATE) {
      versesToDelete.push(date);
    } else {
      versesToKeep.push(date);
    }
  });

  console.log(`📊 Versículos totais: ${versesSnapshot.size}`);
  console.log(`❌ Versículos para deletar (antes de ${START_DATE}): ${versesToDelete.length}`);
  console.log(`✅ Versículos para manter (a partir de ${START_DATE}): ${versesToKeep.length}`);

  if (versesToDelete.length > 0) {
    console.log('🗑️ Deletando versículos...');
    for (const date of versesToDelete) {
      await db.collection('verses').doc(date).delete();
      console.log(`   ❌ Deletado: ${date}`);
    }
    console.log('✅ Versículos deletados com sucesso!');
  } else {
    console.log('✅ Nenhum versículo para deletar.');
  }

  console.log('');
  console.log('📋 Resumo final:');
  console.log(`📝 Mensagens mantidas: ${messagesToKeep.length}`);
  console.log(`📖 Versículos mantidos: ${versesToKeep.length}`);
  
  if (messagesToKeep.length > 0) {
    console.log(`📅 Primeira mensagem: ${messagesToKeep[0]}`);
  }
  if (versesToKeep.length > 0) {
    console.log(`📅 Primeiro versículo: ${versesToKeep[0]}`);
  }

  console.log('');
  console.log('✅ Limpeza concluída!');
}

cleanBeforeStartDate()
  .then(() => {
    console.log('');
    console.log('🎉 Processo concluído com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro:', error);
    process.exit(1);
  });
