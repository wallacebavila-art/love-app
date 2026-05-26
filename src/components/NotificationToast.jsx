import { useState, useEffect, createContext, useContext } from 'react';
import { useTimePeriod } from '../contexts/TimePeriodContext';
import { onForegroundMessage } from '../services/fcmService';
import { getAllNotifications, clearNotifications, deleteOldNotifications } from '../utils/indexedDB';
import { listenToNotifications } from '../services/realtimeNotifications';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    console.log('NotificationProvider montado, configurando listener de notificações');
    
    // Listener para notificações em foreground (FCM)
    const unsubscribeFCM = onForegroundMessage((payload) => {
      console.log('Notificação recebida no NotificationProvider (FCM):', payload);
      const notification = {
        title: payload.notification?.title || 'Notificação',
        body: payload.notification?.body || '',
        timestamp: new Date()
      };
      console.log('Adicionando notificação ao estado:', notification);
      setNotifications(prev => {
        console.log('Notificações anteriores:', prev);
        return [notification, ...prev];
      });
    });

    // Listener para notificações em tempo real (Realtime Database)
    const unsubscribeRTDB = listenToNotifications((realtimeNotifications) => {
      console.log('Notificações recebidas do Realtime Database:', realtimeNotifications);
      setNotifications(realtimeNotifications);
    });

    // Listener para quando o app ganha foco (para capturar notificações recebidas em background)
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        console.log('App ganhou foco, verificando notificações pendentes no IndexedDB');
        try {
          const backgroundNotifications = await getAllNotifications();
          console.log('Notificações encontradas no IndexedDB:', backgroundNotifications);

          if (backgroundNotifications.length > 0) {
            console.log('Adicionando notificações do IndexedDB ao estado');
            // Limpar notificações antigas (mais de 24 horas)
            await deleteOldNotifications();

            // Adicionar notificações do IndexedDB ao estado
            setNotifications(prev => {
              const newNotifications = backgroundNotifications.map(n => ({
                title: n.title,
                body: n.body,
                timestamp: new Date(n.timestamp)
              }));
              console.log('Novas notificações:', newNotifications);
              console.log('Notificações anteriores:', prev);
              const result = [...newNotifications, ...prev];
              console.log('Resultado final:', result);
              return result;
            });

            // Limpar IndexedDB após ler
            await clearNotifications();
            console.log('IndexedDB limpo após ler notificações');
          } else {
            console.log('Nenhuma notificação encontrada no IndexedDB');
          }
        } catch (error) {
          console.error('Erro ao ler notificações do IndexedDB:', error);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Listener para mensagens do service worker
    const handleServiceWorkerMessage = (event) => {
      if (event.data && event.data.type === 'NOTIFICATION_CLICKED') {
        console.log('Mensagem do service worker recebida:', event.data);
        const notification = {
          title: event.data.notification.title,
          body: event.data.notification.body,
          timestamp: new Date(event.data.notification.timestamp)
        };
        setNotifications(prev => [notification, ...prev]);
      }
    };

    navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);

    // Verificar notificações ao montar (caso o app já tenha recebido notificações em background)
    handleVisibilityChange();

    return () => {
      console.log('NotificationProvider desmontado, limpando listener');
      unsubscribeFCM();
      unsubscribeRTDB();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, setNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

const NotificationToast = () => {
  const { period } = useTimePeriod();
  const { notifications, setNotifications } = useNotifications();
  const [visible, setVisible] = useState(false);

  const getCardBackground = () => {
    switch (period) {
      case 'morning':
        return 'bg-black/40';
      case 'afternoon':
        return 'bg-black/40';
      case 'night':
        return 'bg-black/50';
      default:
        return 'bg-black/40';
    }
  };

  const getBorderColor = () => {
    switch (period) {
      case 'morning':
        return 'border-white/35';
      case 'afternoon':
        return 'border-white/35';
      case 'night':
        return 'border-white/25';
      default:
        return 'border-white/35';
    }
  };

  const getTextColor = () => {
    switch (period) {
      case 'morning':
        return 'text-white';
      case 'afternoon':
        return 'text-white';
      case 'night':
        return 'text-white';
      default:
        return 'text-white';
    }
  };

  // Show toast when new notification arrives
  useEffect(() => {
    if (notifications.length > 0) {
      setVisible(true);
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setVisible(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notifications.length]);

  if (!visible || notifications.length === 0) return null;

  const latestNotification = notifications[0];

  return (
    <div className="fixed top-20 right-4 md:right-8 z-50">
      <div className={`${getCardBackground()} backdrop-blur-[24px] -webkit-backdrop-blur-[24px] border ${getBorderColor()} rounded-2xl shadow-2xl shadow-black/10 p-4 max-w-sm animate-bounce-in`}>
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-purple-400 text-2xl">notifications</span>
          <div className="flex-1">
            <h4 className={`font-semibold ${getTextColor()} text-sm mb-1`}>
              {latestNotification.title}
            </h4>
            <p className={`text-sm ${getTextColor()} opacity-90`}>
              {latestNotification.body}
            </p>
          </div>
          <button
            onClick={() => setVisible(false)}
            className={`${getTextColor()} hover:bg-white/20 rounded-full p-1 transition`}
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationToast;
