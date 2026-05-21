/**
 * Script para enviar notificações via Firebase Admin SDK
 * 
 * Uso:
 * node send-notification-admin.js <TOKEN_FCM> <TITULO> <MENSAGEM>
 * node send-notification-admin.js --all <TITULO> <MENSAGEM>
 * 
 * Exemplos:
 * node send-notification-admin.js "seu_token_aqui" "Teste" "Mensagem de teste"
 * node send-notification-admin.js --all "Teste" "Mensagem para todos"
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

const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('❌ Uso incorreto!');
  console.log('Uso: node send-notification-admin.js <TOKEN_FCM> <TITULO> <MENSAGEM>');
  console.log('Uso: node send-notification-admin.js --all <TITULO> <MENSAGEM>');
  console.log('Exemplos:');
  console.log('  node send-notification-admin.js "token" "Teste" "Mensagem de teste"');
  console.log('  node send-notification-admin.js --all "Teste" "Mensagem para todos"');
  console.log('\nPRÉ-REQUISITOS:');
  console.log('1. npm install firebase-admin');
  console.log('2. Baixar o arquivo de credenciais do Service Account do Firebase');
  console.log('3. Renomear o arquivo JSON para "service-account-key.json" e colocar na raiz do projeto');
  process.exit(1);
}

const sendToAll = args[0] === '--all';
const title = sendToAll ? args[1] : args[1];
const body = sendToAll ? args[2] : args[2];
const token = sendToAll ? null : args[0];

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

// Buscar todos os tokens do Firestore se --all
const getAllTokens = async () => {
  try {
    const db = admin.firestore();
    const snapshot = await db.collection('fcm_tokens').get();
    
    const tokens = [];
    snapshot.forEach((doc) => {
      tokens.push(doc.data().token);
    });
    
    return tokens;
  } catch (error) {
    console.error('❌ Erro ao buscar tokens:', error);
    return [];
  }
};

// Enviar notificação para um token
const sendToSingleToken = async (token, title, body) => {
  const message = {
    token: token,
    notification: {
      title: title,
      body: body,
    },
    webpush: {
      notification: {
        icon: '/icon-192.svg',
        badge: '/icon-192.svg',
      },
      fcm_options: {
        link: 'https://para-raissa.firebaseapp.com',
      },
    },
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('✅ Notificação enviada com sucesso!');
    console.log('Response:', response);
  } catch (error) {
    console.error('❌ Erro ao enviar notificação:', error);
    process.exit(1);
  }
};

// Enviar notificação para múltiplos tokens
const sendToMultipleTokens = async (tokens, title, body) => {
  const message = {
    notification: {
      title: title,
      body: body,
    },
    webpush: {
      notification: {
        icon: '/icon-192.svg',
        badge: '/icon-192.svg',
      },
      fcm_options: {
        link: 'https://para-raissa.firebaseapp.com',
      },
    },
  };

  try {
    let successCount = 0;
    let failureCount = 0;
    const failedTokens = [];

    for (const token of tokens) {
      try {
        await admin.messaging().send({ ...message, token });
        successCount++;
      } catch (error) {
        failureCount++;
        failedTokens.push(token);
        console.error(`❌ Erro ao enviar para token ${token.substring(0, 20)}...:`, error.message);
      }
    }

    console.log(`✅ Notificações enviadas com sucesso!`);
    console.log(`Sucesso: ${successCount}, Falhas: ${failureCount}`);
    
    if (failureCount > 0) {
      console.log('Tokens que falharam:', failedTokens.map(t => t.substring(0, 20) + '...'));
    }
  } catch (error) {
    console.error('❌ Erro ao enviar notificações:', error);
    process.exit(1);
  }
};

// Executar envio
if (sendToAll) {
  console.log('📡 Buscando todos os tokens...');
  const tokens = await getAllTokens();
  
  if (tokens.length === 0) {
    console.log('❌ Nenhum token encontrado no Firestore');
    process.exit(1);
  }
  
  console.log(`📱 Enviando para ${tokens.length} dispositivos...`);
  await sendToMultipleTokens(tokens, title, body);
} else {
  await sendToSingleToken(token, title, body);
}
