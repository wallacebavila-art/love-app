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

async function rescheduleAllToStartDate() {
  console.log('🔍 Analisando dados do Firebase...');
  console.log(`📅 Nova data de início: ${START_DATE}`);
  console.log('');

  // Remanejar mensagens
  console.log('📝 Remanejando mensagens...');
  const messagesSnapshot = await db.collection('mensagens').get();
  const messages = [];
  
  messagesSnapshot.forEach((doc) => {
    messages.push({
      id: doc.id,
      data: doc.data()
    });
  });

  // Ordenar mensagens pela data atual
  messages.sort((a, b) => a.id.localeCompare(b.id));

  console.log(`📊 Mensagens totais: ${messages.length}`);
  console.log(`📅 Primeira mensagem atual: ${messages[0]?.id}`);
  console.log(`📅 Última mensagem atual: ${messages[messages.length - 1]?.id}`);
  console.log('');

  // Calcular a nova data para cada mensagem
  const startParts = START_DATE.split('-');
  const startDate = new Date(
    parseInt(startParts[0]),
    parseInt(startParts[1]) - 1, // Mês é 0-indexed em JavaScript
    parseInt(startParts[2]),
    12, 0, 0, 0 // Meio-dia para evitar problemas de fuso horário
  );

  console.log('🔄 Atualizando datas das mensagens...');
  const batch = db.batch();
  const oldDateKeys = [];
  const newDateKeys = [];

  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    const newDate = new Date(startDate);
    newDate.setDate(startDate.getDate() + i);
    
    const year = newDate.getFullYear();
    const month = String(newDate.getMonth() + 1).padStart(2, '0');
    const day = String(newDate.getDate()).padStart(2, '0');
    const newDateKey = `${year}-${month}-${day}`;

    console.log(`   ${i + 1}/${messages.length}: ${message.id} -> ${newDateKey}`);

    // Adicionar ao batch para criar novo documento
    const newDocRef = db.collection('mensagens').doc(newDateKey);
    batch.set(newDocRef, message.data);
    
    oldDateKeys.push(message.id);
    newDateKeys.push(newDateKey);
  }

  // Executar o batch para criar todos os novos documentos
  await batch.commit();
  console.log('✅ Novos documentos criados com sucesso!');

  // Agora deletar os documentos antigos
  console.log('🗑️ Deletando documentos antigos...');
  const deleteBatch = db.batch();
  for (const oldDateKey of oldDateKeys) {
    const oldDocRef = db.collection('mensagens').doc(oldDateKey);
    deleteBatch.delete(oldDocRef);
  }
  await deleteBatch.commit();
  console.log('✅ Documentos antigos deletados com sucesso!');

  console.log('✅ Mensagens remanejadas com sucesso!');
  console.log('');

  // Remanejar versículos
  console.log('📖 Remanejando versículos...');
  const versesSnapshot = await db.collection('verses').get();
  const verses = [];
  
  versesSnapshot.forEach((doc) => {
    verses.push({
      id: doc.id,
      data: doc.data()
    });
  });

  // Ordenar versículos pela data atual
  verses.sort((a, b) => a.id.localeCompare(b.id));

  console.log(`📊 Versículos totais: ${verses.length}`);
  console.log(`📅 Primeiro versículo atual: ${verses[0]?.id}`);
  console.log(`📅 Último versículo atual: ${verses[verses.length - 1]?.id}`);
  console.log('');

  console.log('🔄 Atualizando datas dos versículos...');
  const versesBatch = db.batch();
  const oldVerseDateKeys = [];
  const newVerseDateKeys = [];

  for (let i = 0; i < verses.length; i++) {
    const verse = verses[i];
    const newDate = new Date(startDate);
    newDate.setDate(startDate.getDate() + i);
    
    const year = newDate.getFullYear();
    const month = String(newDate.getMonth() + 1).padStart(2, '0');
    const day = String(newDate.getDate()).padStart(2, '0');
    const newDateKey = `${year}-${month}-${day}`;

    console.log(`   ${i + 1}/${verses.length}: ${verse.id} -> ${newDateKey}`);

    // Adicionar ao batch para criar novo documento
    const newDocRef = db.collection('verses').doc(newDateKey);
    versesBatch.set(newDocRef, verse.data);
    
    oldVerseDateKeys.push(verse.id);
    newVerseDateKeys.push(newDateKey);
  }

  // Executar o batch para criar todos os novos documentos
  await versesBatch.commit();
  console.log('✅ Novos documentos criados com sucesso!');

  // Agora deletar os documentos antigos
  console.log('🗑️ Deletando documentos antigos...');
  const deleteVersesBatch = db.batch();
  for (const oldDateKey of oldVerseDateKeys) {
    const oldDocRef = db.collection('verses').doc(oldDateKey);
    deleteVersesBatch.delete(oldDocRef);
  }
  await deleteVersesBatch.commit();
  console.log('✅ Documentos antigos deletados com sucesso!');

  console.log('✅ Versículos remanejados com sucesso!');
  console.log('');

  // Verificar resultado final
  console.log('📋 Verificando resultado final...');
  const finalMessagesSnapshot = await db.collection('mensagens').get();
  const finalVersesSnapshot = await db.collection('verses').get();

  const finalMessages = [];
  finalMessagesSnapshot.forEach((doc) => finalMessages.push(doc.id));
  finalMessages.sort();

  const finalVerses = [];
  finalVersesSnapshot.forEach((doc) => finalVerses.push(doc.id));
  finalVerses.sort();

  console.log(`📝 Mensagens finais: ${finalMessages.length}`);
  console.log(`📅 Primeira mensagem: ${finalMessages[0]}`);
  console.log(`📅 Última mensagem: ${finalMessages[finalMessages.length - 1]}`);
  console.log('');
  console.log(`📖 Versículos finais: ${finalVerses.length}`);
  console.log(`📅 Primeiro versículo: ${finalVerses[0]}`);
  console.log(`📅 Último versículo: ${finalVerses[finalVerses.length - 1]}`);

  console.log('');
  console.log('✅ Remanejamento concluído!');
}

rescheduleAllToStartDate()
  .then(() => {
    console.log('');
    console.log('🎉 Processo concluído com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro:', error);
    process.exit(1);
  });
