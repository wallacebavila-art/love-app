import { useNotifications } from './NotificationToast';

const NotificationModal = ({ isOpen, onClose }) => {
  const { notifications } = useNotifications();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Notificações</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <span className="material-symbols-outlined text-4xl mb-2">notifications_none</span>
              <p>Nenhuma notificação</p>
            </div>
          ) : (
            notifications.map((notification, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg p-4 mb-3 hover:bg-gray-100 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-800">{notification.title}</h3>
                  <span className="text-xs text-gray-500">
                    {notification.timestamp instanceof Date 
                      ? notification.timestamp.toLocaleString('pt-BR')
                      : new Date(notification.timestamp).toLocaleString('pt-BR')
                    }
                  </span>
                </div>
                <p className="text-gray-600 text-sm">{notification.body}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
