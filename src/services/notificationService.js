/**
 * Serviço de notificações push (Web)
 */

// Solicita permissão para notificações
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('Este navegador não suporta notificações');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

// Envia notificação local
export const sendLocalNotification = (title, body) => {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body: body,
      icon: '/icon-192.svg',
      badge: '/icon-192.svg',
      vibrate: [200, 100, 200]
    });
  }
};

// Envia notificação de mensagem do dia
export const sendDailyMessageNotification = (message) => {
  sendLocalNotification(
    'Mensagem do dia disponível! 💕',
    message?.substring(0, 100) + '...' || 'Venha ver sua mensagem de hoje!'
  );
};

// Agenda notificação diária (usando setInterval para simplificar)
let notificationInterval = null;

export const scheduleDailyNotification = (callback) => {
  // Cancela notificação anterior se existir
  if (notificationInterval) {
    clearInterval(notificationInterval);
  }

  // Verifica a cada hora se é hora de enviar notificação
  notificationInterval = setInterval(() => {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();

    // Envia notificação às 7:00 da manhã
    if (hour === 7 && minute === 0) {
      callback();
    }
  }, 60000); // Verifica a cada minuto
};

export const cancelDailyNotification = () => {
  if (notificationInterval) {
    clearInterval(notificationInterval);
    notificationInterval = null;
  }
};
