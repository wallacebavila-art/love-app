import { messaging } from './firebaseConfig';
import { getToken, onMessage } from 'firebase/messaging';

const VAPID_KEY = 'BJC0lA2yYsvDVi-ifUD3UojfrKaquVnQfAFC2jHXthIXUZBM3KEj396dV-dM5YAETyHpF4SZbmEFldM70s4i68o';

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

    // Obter token FCM
    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    
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
    return null;
  }
};

/**
 * Configura o listener para mensagens em foreground
 * @param {Function} callback - Função a ser chamada quando receber uma mensagem
 */
export const onForegroundMessage = (callback) => {
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
