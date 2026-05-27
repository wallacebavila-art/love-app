import { useState, useEffect, createContext, useContext } from 'react';
import { useTimePeriod } from '../contexts/TimePeriodContext';
import { useAuth } from '../contexts/AuthContext';
import { onForegroundMessage } from '../services/fcmService';
import { getAllNotifications, clearNotifications, deleteOldNotifications } from '../utils/indexedDB';
import { listenToNotifications } from '../services/realtimeNotifications';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [lastViewedTimestamp, setLastViewedTimestamp] = useState(null);

  useEffect(() => {
    // Carregar timestamp da última visualização
    const savedTimestamp = localStorage.getItem('lastViewedTimestamp');
    if (savedTimestamp) {
      setLastViewedTimestamp(parseInt(savedTimestamp));
    }
  }, []);

  // Atualizar timestamp quando mudar
  useEffect(() => {
    if (lastViewedTimestamp !== null) {
      localStorage.setItem('lastViewedTimestamp', lastViewedTimestamp.toString());
    }
  }, [lastViewedTimestamp]);

  useEffect(() => {
    // Listener para notificações em foreground (FCM)
    const unsubscribeFCM = onForegroundMessage((payload) => {
      const notification = {
        title: payload.notification?.title || 'Notificação',
        body: payload.notification?.body || '',
        timestamp: new Date()
      };
      setNotifications(prev => [notification, ...prev]);
    });

    // Listener para notificações em tempo real (Firestore)
    const unsubscribeRTDB = listenToNotifications((realtimeNotifications) => {
      setNotifications(realtimeNotifications);
    });

    // Listener para quando o app ganha foco (para capturar notificações recebidas em background)
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        try {
          const backgroundNotifications = await getAllNotifications();

          if (backgroundNotifications.length > 0) {
            // Limpar notificações antigas (mais de 24 horas)
            await deleteOldNotifications();

            // Adicionar notificações do IndexedDB ao estado
            setNotifications(prev => {
              const newNotifications = backgroundNotifications.map(n => ({
                title: n.title,
                body: n.body,
                timestamp: new Date(n.timestamp)
              }));
              return [...newNotifications, ...prev];
            });

            // Limpar IndexedDB após ler
            await clearNotifications();
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
      unsubscribeFCM();
      unsubscribeRTDB();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, setNotifications, lastViewedTimestamp, setLastViewedTimestamp }}>
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
  const { user } = useAuth();
  const { notifications, setNotifications, lastViewedTimestamp, setLastViewedTimestamp } = useNotifications();
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

  // Filtrar apenas notificações não visualizadas e que não foram enviadas por mim
  const unreadNotifications = notifications.filter(n => {
    // Ignorar notificações enviadas pelo próprio usuário
    if (n.sender === user?.userType) return false;
    if (!lastViewedTimestamp) return true;
    const timestamp = n.timestamp instanceof Date ? n.timestamp.getTime() : new Date(n.timestamp).getTime();
    return timestamp > lastViewedTimestamp;
  });

  // Show toast when new notification arrives
  useEffect(() => {
    if (unreadNotifications.length > 0) {
      setVisible(true);
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setVisible(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [unreadNotifications.length]);

  if (!visible || unreadNotifications.length === 0 || !user) return null;

  const latestNotification = unreadNotifications[0];

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
