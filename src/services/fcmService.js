import { messaging } from './firebaseConfig';
import { getToken, onMessage } from 'firebase/messaging';
import { FCM_VAPID_KEY } from '../constants/appConfig';
import { logger } from '../utils/logger';

/**
 * Solicita permissão para notificações e gera o token FCM
 * @returns {Promise<string|null>} O token FCM ou null se falhar
 */
export const requestFCMToken = async () => {
  try {
    // Verificar se o navegador suporta notificações
    if (!('Notification' in window)) {
      logger.log('Este navegador não suporta notificações');
      return null;
    }

    // Solicitar permissão
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      logger.log('Permissão de notificação não concedida');
      return null;
    }

    // Obter token FCM com caminho correto do service worker
    // Em desenvolvimento local, o service worker pode não funcionar corretamente
    // Em produção, o VitePWA gera o service worker automaticamente
    let registration;
    try {
      registration = await navigator.serviceWorker.register('/love-app/firebase-messaging-sw.js', {
        scope: '/love-app/',
        updateViaCache: 'none'
      });
      await registration.update();
      logger.log('Service worker registrado e atualizado:', registration);
    } catch (swError) {
      logger.warn('Não foi possível registrar o service worker do Firebase:', swError.message);
      logger.warn('FCM pode não funcionar em desenvolvimento local. Em produção, o VitePWA gerará o service worker automaticamente.');
      // Continuar sem service worker - FCM não funcionará em foreground
    }

    const token = await getToken(messaging, {
      vapidKey: FCM_VAPID_KEY,
      serviceWorkerRegistration: registration
    });

    if (token) {
      logger.log('Token FCM gerado:', token);
      // Aqui você pode enviar o token para o seu servidor
      return token;
    } else {
      logger.log('Nenhum token de registro disponível');
      return null;
    }
  } catch (error) {
    logger.error('Erro ao obter token FCM:', error);
    if (error.code === 'messaging/token-subscribe-failed') {
      logger.warn('Erro de autenticação FCM: VAPID Key pode estar incorreta ou não configurada no Firebase Console');
      logger.warn('Para configurar: Firebase Console > Project Settings > Cloud Messaging > Web Push Certificates');
    }
    return null;
  }
};

/**
 * Configura o listener para mensagens em foreground
 * @param {Function} callback - Função a ser chamada quando receber uma mensagem
 */
export const onForegroundMessage = (callback) => {
  logger.log('Configurando listener de mensagens em foreground');
  return onMessage(messaging, (payload) => {
    logger.log('Mensagem recebida em foreground:', payload);
    callback(payload);
  });
};

/**
 * Envia notificação local a partir de um payload FCM
 * @param {Object} payload - Payload da mensagem FCM
 */
export const showNotification = (payload) => {
  const notificationTitle = payload.notification?.title || 'Nova Mensagem';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: payload.notification?.icon || '/icon-192.svg',
    badge: payload.notification?.badge || '/icon-192.svg',
    data: payload.data,
  };

  new Notification(notificationTitle, notificationOptions);
};
