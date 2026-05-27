import { useNotifications } from './NotificationToast';
import { useState } from 'react';
import { sendRealtimeNotification } from '../services/realtimeNotifications';
import { useTimePeriod } from '../contexts/TimePeriodContext';

const NotificationModal = ({ isOpen, onClose }) => {
  const { notifications } = useNotifications();
  const { period } = useTimePeriod();
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className={`relative ${getCardBackground()} backdrop-blur-[24px] -webkit-backdrop-blur-[24px] border ${getBorderColor()} rounded-[32px] shadow-2xl shadow-black/10 w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col`}>
        <div className={`px-6 py-4 flex justify-between items-center border-b ${getBorderColor()}`}>
          <h2 className={`text-2xl font-bold ${getTextColor()}`}>Conversa</h2>
          <button
            onClick={onClose}
            className={`${getTextColor()} hover:bg-white/20 rounded-full p-2 transition`}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-white/60">
              <span className="material-symbols-outlined text-4xl mb-2">chat_bubble_outline</span>
              <p>Nenhuma mensagem</p>
            </div>
          ) : (
            notifications.map((notification, index) => (
              <div
                key={index}
                className={`mb-3 p-4 rounded-lg ${
                  notification.sender === 'raissa' 
                    ? 'bg-purple-500/30 ml-8' 
                    : 'bg-white/10 mr-8'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-xs font-semibold ${
                    notification.sender === 'raissa' ? 'text-purple-300' : 'text-white/80'
                  }`}>
                    {notification.sender === 'raissa' ? 'Você' : 'Amor da sua Vida'}
                  </span>
                  <span className="text-xs text-white/60">
                    {notification.timestamp instanceof Date 
                      ? notification.timestamp.toLocaleString('pt-BR')
                      : new Date(notification.timestamp).toLocaleString('pt-BR')
                    }
                  </span>
                </div>
                <p className="text-white text-sm">{notification.body}</p>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-white/20">
          <div className="flex gap-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendReply()}
              placeholder="Digite sua resposta..."
              className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-white placeholder-white/50"
              disabled={sending}
            />
            <button
              onClick={handleSendReply}
              disabled={sending || !replyText.trim()}
              className="px-4 py-2 bg-purple-500/50 text-white rounded-lg hover:bg-purple-500/70 disabled:bg-white/20 disabled:cursor-not-allowed transition-colors"
            >
              {sending ? 'Enviando...' : 'Enviar'}
            </button>
          </div>
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
};

export default NotificationModal;
