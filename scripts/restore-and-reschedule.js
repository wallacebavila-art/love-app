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

async function restoreAndReschedule() {
  console.log('🔍 Restaurando dados do backup...');
  console.log('');

  // Restaurar mensagens
  console.log('📝 Restaurando mensagens...');
  const messagesBackupPath = path.join(__dirname, '../backups/mensagens.json');
  const messagesBackup = JSON.parse(fs.readFileSync(messagesBackupPath, 'utf8'));

  console.log(`📊 Mensagens no backup: ${messagesBackup.length}`);

  // Limpar mensagens existentes
  const existingMessagesSnapshot = await db.collection('mensagens').get();
  const deleteMessagesBatch = db.batch();
  existingMessagesSnapshot.forEach((doc) => {
    deleteMessagesBatch.delete(doc.ref);
  });
  await deleteMessagesBatch.commit();
  console.log('✅ Mensagens existentes deletadas');

  // Restaurar mensagens do backup
  const messagesBatch = db.batch();
  messagesBackup.forEach((mensagem, index) => {
    const dateKey = `temp-${index}`; // Data temporária única
    const docRef = db.collection('mensagens').doc(dateKey);
    messagesBatch.set(docRef, { mensagem, date: dateKey });
  });
  await messagesBatch.commit();
  console.log('✅ Mensagens restauradas do backup');
  console.log('');

  // Restaurar versículos
  console.log('📖 Restaurando versículos...');
  const versesBackupPath = path.join(__dirname, '../backups/verses.json');
  const versesBackup = JSON.parse(fs.readFileSync(versesBackupPath, 'utf8'));

  console.log(`📊 Versículos no backup: ${versesBackup.length}`);

  // Limpar versículos existentes
  const existingVersesSnapshot = await db.collection('verses').get();
  const deleteVersesBatch = db.batch();
  existingVersesSnapshot.forEach((doc) => {
    deleteVersesBatch.delete(doc.ref);
  });
  await deleteVersesBatch.commit();
  console.log('✅ Versículos existentes deletados');

  // Restaurar versículos do backup
  const versesBatch = db.batch();
  versesBackup.forEach((verse, index) => {
    const dateKey = `temp-verse-${index}`; // Data temporária única
    const docRef = db.collection('verses').doc(dateKey);
    // Usar o formato correto do backup
    const mensagem = `${verse.versiculo_texto} - ${verse.versiculo_ref}`;
    versesBatch.set(docRef, { mensagem, date: dateKey });
  });
  await versesBatch.commit();
  console.log('✅ Versículos restaurados do backup');
  console.log('');

  // Agora fazer o remanejamento correto
  console.log('🔄 Iniciando remanejamento...');
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

  // Calcular a nova data para cada mensagem
  const startParts = START_DATE.split('-');
  const startDate = new Date(
    parseInt(startParts[0]),
    parseInt(startParts[1]) - 1,
    parseInt(startParts[2]),
    12, 0, 0, 0
  );

  const newMessagesBatch = db.batch();
  const oldMessageDateKeys = [];

  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    const newDate = new Date(startDate);
    newDate.setDate(startDate.getDate() + i);
    
    const year = newDate.getFullYear();
    const month = String(newDate.getMonth() + 1).padStart(2, '0');
    const day = String(newDate.getDate()).padStart(2, '0');
    const newDateKey = `${year}-${month}-${day}`;

    console.log(`   ${i + 1}/${messages.length}: ${newDateKey}`);

    const newDocRef = db.collection('mensagens').doc(newDateKey);
    newMessagesBatch.set(newDocRef, message.data);
    
    oldMessageDateKeys.push(message.id);
  }

  await newMessagesBatch.commit();
  console.log('✅ Novas mensagens criadas');

  const deleteOldMessagesBatch = db.batch();
  for (const oldDateKey of oldMessageDateKeys) {
    const oldDocRef = db.collection('mensagens').doc(oldDateKey);
    deleteOldMessagesBatch.delete(oldDocRef);
  }
  await deleteOldMessagesBatch.commit();
  console.log('✅ Mensagens antigas deletadas');
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

  verses.sort((a, b) => a.id.localeCompare(b.id));

  console.log(`📊 Versículos totais: ${verses.length}`);

  const newVersesBatch = db.batch();
  const oldVerseDateKeys = [];

  for (let i = 0; i < verses.length; i++) {
    const verse = verses[i];
    const newDate = new Date(startDate);
    newDate.setDate(startDate.getDate() + i);
    
    const year = newDate.getFullYear();
    const month = String(newDate.getMonth() + 1).padStart(2, '0');
    const day = String(newDate.getDate()).padStart(2, '0');
    const newDateKey = `${year}-${month}-${day}`;

    console.log(`   ${i + 1}/${verses.length}: ${newDateKey}`);

    const newDocRef = db.collection('verses').doc(newDateKey);
    newVersesBatch.set(newDocRef, verse.data);
    
    oldVerseDateKeys.push(verse.id);
  }

  await newVersesBatch.commit();
  console.log('✅ Novos versículos criados');

  const deleteOldVersesBatch = db.batch();
  for (const oldDateKey of oldVerseDateKeys) {
    const oldDocRef = db.collection('verses').doc(oldDateKey);
    deleteOldVersesBatch.delete(oldDocRef);
  }
  await deleteOldVersesBatch.commit();
  console.log('✅ Versículos antigos deletados');
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
  console.log('✅ Processo concluído!');
}

restoreAndReschedule()
  .then(() => {
    console.log('');
    console.log('🎉 Processo concluído com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro:', error);
    process.exit(1);
  });
