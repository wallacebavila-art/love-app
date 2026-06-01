import { messaging } from './firebaseConfig';
import { getToken, onMessage } from 'firebase/messaging';

const VAPID_KEY = import.meta.env.VITE_FCM_VAPID_KEY || 'BJC0lA2yYsvDVi-ifUD3UojfrKaquVnQfAFC2jHXthIXUZBM3KEj396dV-dM5YAETyHpF4SZbmEFldM70s4i68o';

/**
 * Solicita permissão para notificações e gera o token FCM
 * @returns {Promise<string|null>} O token FCM ou null se falhar
 */
export const requestFCMToken = async () => {
  try {
    // Verificar se o navegador suporta notificações
    if (!('Notification' in window)) {
      console.log('Este navegador não suporta notificações');
      return null;
    }

    // Solicitar permissão
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Permissão de notificação não concedida');
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
      console.log('Service worker registrado e atualizado:', registration);
    } catch (swError) {
      console.warn('Não foi possível registrar o service worker do Firebase:', swError.message);
      console.warn('FCM pode não funcionar em desenvolvimento local. Em produção, o VitePWA gerará o service worker automaticamente.');
      // Continuar sem service worker - FCM não funcionará em foreground
    }

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration
    });

    if (token) {
      console.log('Token FCM gerado:', token);
      // Aqui você pode enviar o token para o seu servidor
      return token;
    } else {
      console.log('Nenhum token de registro disponível');
      return null;
    }
  } catch (error) {
    console.error('Erro ao obter token FCM:', error);
    if (error.code === 'messaging/token-subscribe-failed') {
      console.warn('Erro de autenticação FCM: VAPID Key pode estar incorreta ou não configurada no Firebase Console');
      console.warn('Para configurar: Firebase Console > Project Settings > Cloud Messaging > Web Push Certificates');
    }
    return null;
  }
};

/**
 * Configura o listener para mensagens em foreground
 * @param {Function} callback - Função a ser chamada quando receber uma mensagem
 */
export const onForegroundMessage = (callback) => {
  console.log('Configurando listener de mensagens em foreground');
  return onMessage(messaging, (payload) => {
    console.log('Mensagem recebida em foreground:', payload);
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
