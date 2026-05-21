/**
 * Script agendado para enviar notificações automáticas às 7:00
 * 
 * Uso:
 * node scheduled-notification.js
 * 
 * Este script roda continuamente e envia a mensagem do dia às 7:00
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
  process.exit(1);
}

// Buscar todos os tokens do Firestore
const getAllTokens = async () => {
  try {
    const db = admin.firestore();
    const snapshot = await db.collection('fcm_tokens').get();
    
    const tokens = [];
    snapshot.forEach((doc) => {
      tokens.push({
        token: doc.data().token,
        lastUsed: doc.data().lastUsed,
        createdAt: doc.data().createdAt
      });
    });
    
    return tokens;
  } catch (error) {
    console.error('❌ Erro ao buscar tokens:', error);
    return [];
  }
};

// Buscar mensagem do dia do Firestore
const getDailyMessage = async () => {
  try {
    const db = admin.firestore();
    const today = new Date().toISOString().split('T')[0];
    const doc = await db.collection('messages').doc(today).get();
    
    if (doc.exists) {
      return doc.data().message;
    } else {
      return 'Mensagem do dia não encontrada';
    }
  } catch (error) {
    console.error('❌ Erro ao buscar mensagem do dia:', error);
    return 'Erro ao buscar mensagem';
  }
};

// Enviar notificação para todos os tokens
const sendNotificationToAll = async (title, body) => {
  try {
    const tokens = await getAllTokens();
    
    if (tokens.length === 0) {
      console.log('❌ Nenhum token encontrado');
      return;
    }
    
    const message = {
      notification: {
        title: title,
        body: body,
      },
      webpush: {
        notification: {
          icon: '/love-app/icon-192.svg',
          badge: '/love-app/icon-192.svg',
        },
        fcm_options: {
          link: 'https://wallacebavila-art.github.io/love-app/',
        },
      },
    };

    let successCount = 0;
    let failureCount = 0;

    for (const tokenData of tokens) {
      try {
        await admin.messaging().send({ ...message, token: tokenData.token });
        successCount++;
      } catch (error) {
        failureCount++;
        console.error(`❌ Erro ao enviar para token ${tokenData.token.substring(0, 20)}...:`, error.message);
      }
    }

    console.log(`✅ Notificação enviada: ${successCount}/${tokens.length} dispositivos (${failureCount} falhas)`);
  } catch (error) {
    console.error('❌ Erro ao enviar notificações:', error);
  }
};

// Verificar se é 7:00 e enviar notificação
const checkAndSendNotification = async () => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  
  if (hours === 7 && minutes === 0) {
    console.log('🕗 São 7:00! Enviando notificação...');
    
    const message = await getDailyMessage();
    await sendNotificationToAll('Bom dia! 💕', message);
  }
};

// Aguardar até 7:00
const waitFor7AM = () => {
  const now = new Date();
  const target = new Date();
  target.setHours(7, 0, 0, 0);
  
  if (now > target) {
    target.setDate(target.getDate() + 1);
  }
  
  const delay = target - now;
  console.log(`⏰ Próxima notificação às 7:00 (${delay / 1000 / 60} minutos restantes)`);
  
  setTimeout(() => {
    checkAndSendNotification();
    // Agendar para o próximo dia
    waitFor7AM();
  }, delay);
};

// Iniciar
console.log('🚀 Script de notificação agendada iniciado');
waitFor7AM();
