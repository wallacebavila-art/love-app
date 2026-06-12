/**
 * Script para atualizar a primeira mensagem do dia 12 no Firestore
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Mensagem correta do dia 12
const correctMessage = "Feliz Dia dos Namorados, meu amor! Hoje o calendário nos lembra de celebrar o que temos, mas a verdade é que me lembra a sorte que tenho de te ter você ao meu lado todos os dias. Olhar para a nossa trajetória e ver a cumplicidade, parceria, amizade e a intimidade que construímos me dá a certeza absoluta de que você é a melhor escolha da minha vida. Você não é apenas a mulher que eu amo, é a minha maior inspiração todos os dias, meu porto seguro e a minha amiga para todas as horas. Que hoje a gente possa comemorar a nossa união, os obstáculos que já superamos e o futuro gigante que ainda vamos escrever lado a lado. Obrigado por ser essa mulher tão forte, inteligente, dedicada, calma e especial em tudo que faz. Feliz dia dos namorados, meu amor. Eu te amo muito além do que qualquer palavra consiga expressar.";

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

async function updateMessage() {
  try {
    // Atualizar documento 2026-06-12
    const dateDocRef = db.collection('mensagens').doc('2026-06-12');
    
    // Verificar se o documento existe
    const doc = await dateDocRef.get();
    if (!doc.exists) {
      // Se não existe, criar
      await dateDocRef.set({ mensagem: correctMessage });
      console.log('✅ Mensagem criada no documento 2026-06-12');
    } else {
      // Se existe, atualizar
      await dateDocRef.update({ mensagem: correctMessage });
      console.log('✅ Mensagem atualizada no documento 2026-06-12');
    }

    console.log('\n🎉 Atualização concluída com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao atualizar mensagem:', error.message);
    process.exit(1);
  }
}

updateMessage();
