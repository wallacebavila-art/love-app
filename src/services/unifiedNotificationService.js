/**
 * Serviço Unificado de Notificações
 * Coordena Web Notifications, FCM, Firestore e IndexedDB
 */

import { sendLocalNotification, requestNotificationPermission as requestWebPermission } from './notificationService';
import { requestFCMToken, onForegroundMessage, showNotification as showFCMNotification } from './fcmService';
import { sendRealtimeNotification } from './realtimeNotifications';
import { saveFCMToken } from './fcmTokenService';
import { addNotification, getAllNotifications } from '../utils/indexedDB';
import { logger } from '../utils/logger';

/**
 * Tipos de notificação
 */
export const NOTIFICATION_TYPES = {
  MESSAGE: 'message',
  VERSE: 'verse',
  WEATHER: 'weather',
  REMINDER: 'reminder',
  SYSTEM: 'system'
};

/**
 * Solicita permissão para notificações (Web + FCM)
 * @returns {Promise<boolean>} True se permissão concedida
 */
export const requestNotificationPermission = async () => {
  try {
    // Solicitar permissão Web
    const webPermission = await requestWebPermission();
    
    // Solicitar permissão FCM e salvar token
    const fcmToken = await requestFCMToken();
    if (fcmToken) {
      await saveFCMToken(fcmToken);
    }
    
    return webPermission;
  } catch (error) {
    logger.error('Erro ao solicitar permissão de notificação:', error);
    return false;
  }
};

/**
 * Envia notificação unificada (todos os canais)
 * @param {string} title - Título da notificação
 * @param {string} body - Corpo da notificação
 * @param {Object} options - Opções adicionais
 * @param {string} options.type - Tipo de notificação
 * @param {string} options.sender - Remetente
 * @param {string} options.audioUrl - URL de áudio opcional
 * @param {Object} options.data - Dados adicionais
 * @returns {Promise<boolean>} True se enviado com sucesso
 */
export const sendNotification = async (title, body, options = {}) => {
  const { type = NOTIFICATION_TYPES.SYSTEM, sender = 'system', audioUrl = null, data = {} } = options;
  
  try {
    // 1. Salvar no Firestore (para sincronização entre dispositivos)
    await sendRealtimeNotification(title, body, sender, audioUrl);
    
    // 2. Enviar via FCM (push notifications)
    // Nota: Isso é feito pelo backend, não pelo cliente
    
    // 3. Mostrar notificação local (foreground)
    sendLocalNotification(title, body);
    
    // 4. Persistir no IndexedDB (histórico)
    await addNotification({
      title,
      body,
      type,
      sender,
      audioUrl,
      data,
      timestamp: Date.now(),
      read: false
    });
    
    logger.log('✅ Notificação enviada via todos os canais');
    return true;
  } catch (error) {
    logger.error('❌ Erro ao enviar notificação unificada:', error);
    return false;
  }
};

/**
 * Configura listener para mensagens em foreground (FCM)
 * @param {Function} callback - Callback quando receber mensagem
 * @returns {Function} Função para unsubscribe
 */
export const setupForegroundMessageListener = (callback) => {
  return onForegroundMessage((payload) => {
    logger.log('Mensagem FCM recebida em foreground:', payload);
    
    // Mostrar notificação local
    showFCMNotification(payload);
    
    // Persistir no IndexedDB
    addNotification({
      title: payload.notification?.title || 'Nova Mensagem',
      body: payload.notification?.body || '',
      type: NOTIFICATION_TYPES.SYSTEM,
      sender: payload.data?.sender || 'system',
      audioUrl: payload.data?.audioUrl || null,
      data: payload.data || {},
      timestamp: Date.now(),
      read: false
    });
    
    // Chamar callback
    callback(payload);
  });
};

/**
 * Busca histórico de notificações do IndexedDB
 * @returns {Promise<Array>} Lista de notificações
 */
export const getNotificationHistory = async () => {
  try {
    const notifications = await getAllNotifications();
    return notifications.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    logger.error('Erro ao buscar histórico de notificações:', error);
    return [];
  }
};

/**
 * Envia notificação de mensagem do dia
 * @param {string} message - Mensagem do dia
 * @returns {Promise<boolean>}
 */
export const sendDailyMessageNotification = async (message) => {
  return sendNotification(
    'Mensagem do dia disponível! 💕',
    message?.substring(0, 100) + '...' || 'Venha ver sua mensagem de hoje!',
    {
      type: NOTIFICATION_TYPES.MESSAGE,
      sender: 'system'
    }
  );
};

/**
 * Envia notificação de versículo do dia
 * @param {Object} verse - Objeto do versículo
 * @returns {Promise<boolean>}
 */
export const sendDailyVerseNotification = async (verse) => {
  return sendNotification(
    'Versículo do dia 📖',
    verse?.text?.substring(0, 100) + '...' || 'Venha ver o versículo de hoje!',
    {
      type: NOTIFICATION_TYPES.VERSE,
      sender: 'system',
      data: { reference: verse?.reference }
    }
  );
};

/**
 * Envia notificação personalizada
 * @param {string} title - Título
 * @param {string} body - Corpo
 * @param {Object} options - Opções
 * @returns {Promise<boolean>}
 */
export const sendCustomNotification = async (title, body, options = {}) => {
  return sendNotification(title, body, options);
};
