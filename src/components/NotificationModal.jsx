import { useNotifications } from './NotificationToast';
import { useState } from 'react';
import { sendRealtimeNotification } from '../services/realtimeNotifications';

const NotificationModal = ({ isOpen, onClose }) => {
  const { notifications } = useNotifications();
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    
    setSending(true);
    try {
      const success = await sendRealtimeNotification('Resposta', replyText, 'raissa');
      if (success) {
        setReplyText('');
      } else {
        alert('Erro ao enviar resposta');
      }
    } catch (error) {
      console.error('Erro ao enviar resposta:', error);
      alert('Erro ao enviar resposta');
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Conversa</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto flex-1">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <span className="material-symbols-outlined text-4xl mb-2">chat_bubble_outline</span>
              <p>Nenhuma mensagem</p>
            </div>
          ) : (
            notifications.map((notification, index) => (
              <div
                key={index}
                className={`mb-3 p-4 rounded-lg ${
                  notification.sender === 'raissa' 
                    ? 'bg-purple-100 ml-8' 
                    : 'bg-gray-100 mr-8'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-xs font-semibold ${
                    notification.sender === 'raissa' ? 'text-purple-700' : 'text-gray-600'
                  }`}>
                    {notification.sender === 'raissa' ? 'Você' : 'Amor da sua Vida'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {notification.timestamp instanceof Date 
                      ? notification.timestamp.toLocaleString('pt-BR')
                      : new Date(notification.timestamp).toLocaleString('pt-BR')
                    }
                  </span>
                </div>
                <p className="text-gray-800 text-sm">{notification.body}</p>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendReply()}
              placeholder="Digite sua resposta..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={sending}
            />
            <button
              onClick={handleSendReply}
              disabled={sending || !replyText.trim()}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {sending ? 'Enviando...' : 'Enviar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
