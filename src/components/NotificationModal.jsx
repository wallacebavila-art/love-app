import { useNotifications } from './NotificationToast';
import { useState, useEffect, useRef } from 'react';
import { sendRealtimeNotification } from '../services/realtimeNotifications';
import { useTimePeriod } from '../contexts/TimePeriodContext';
import { useAuth } from '../contexts/AuthContext';
import raissaAvatar from '../assets/raissa-avatar.png';

const NotificationModal = ({ isOpen, onClose }) => {
  const { notifications } = useNotifications();
  const { period } = useTimePeriod();
  const { user } = useAuth();
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

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

  const formatTime = (timestamp) => {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const getAvatarColor = (sender) => {
    return sender === 'raissa' ? 'bg-purple-500' : 'bg-green-500';
  };

  const getAvatarInitials = (sender) => {
    return sender === 'raissa' ? 'R' : 'W';
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    
    setSending(true);
    try {
      const success = await sendRealtimeNotification('Resposta', replyText, user?.userType || 'raissa');
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [notifications, isOpen]);

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
        
        <div className="p-4 overflow-y-auto flex-1 custom-scrollbar bg-gradient-to-b from-white/5 to-white/10">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-white/60">
              <span className="material-symbols-outlined text-4xl mb-2">chat_bubble_outline</span>
              <p>Nenhuma mensagem</p>
            </div>
          ) : (
            [...notifications].sort((a, b) => {
              const dateA = a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp);
              const dateB = b.timestamp instanceof Date ? b.timestamp : new Date(b.timestamp);
              return dateA - dateB;
            }).map((notification, index) => (
              <div
                key={index}
                className={`flex mb-3 ${notification.sender === user?.userType ? 'justify-end' : 'justify-start'}`}
              >
                {notification.sender !== user?.userType && (
                  <div className={`w-10 h-10 rounded-full mr-3 flex-shrink-0 overflow-hidden ${
                    notification.sender === 'raissa' ? '' : getAvatarColor(notification.sender) + ' flex items-center justify-center'
                  }`}>
                    {notification.sender === 'raissa' ? (
                      <img src={raissaAvatar} alt="Raíssa" className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <span className="text-white font-semibold">{getAvatarInitials(notification.sender)}</span>
                    )}
                  </div>
                )}
                <div className={`max-w-[70%] ${notification.sender === user?.userType ? 'order-2' : ''}`}>
                  <div
                    className={`p-3 rounded-2xl ${
                      notification.sender === user?.userType
                        ? 'bg-[#005c4b] text-white rounded-tr-sm'
                        : 'bg-white text-gray-800 rounded-tl-sm'
                    }`}
                  >
                    <p className={`text-sm ${notification.sender === user?.userType ? 'text-white' : 'text-gray-800'}`}>
                      {notification.body}
                    </p>
                  </div>
                  <div className={`flex items-center mt-1 ${notification.sender === user?.userType ? 'justify-end' : 'justify-start'}`}>
                    <span className={`text-xs ${notification.sender === user?.userType ? 'text-white/60' : 'text-white/50'}`}>
                      {formatTime(notification.timestamp)}
                    </span>
                    {notification.sender === user?.userType && (
                      <span className="material-symbols-outlined text-xs text-white/60 ml-1">done_all</span>
                    )}
                  </div>
                </div>
                {notification.sender === user?.userType && (
                  <div className={`w-10 h-10 rounded-full ml-3 flex-shrink-0 overflow-hidden ${getAvatarColor(notification.sender)} flex items-center justify-center`}>
                    {notification.sender === 'raissa' ? (
                      <img src={raissaAvatar} alt="Raíssa" className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <span className="text-white font-semibold">{getAvatarInitials(notification.sender)}</span>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-3 border-t border-white/20 bg-white/5">
          <div className="flex gap-2 items-center">
            <button className="p-2 text-white/60 hover:text-white transition">
              <span className="material-symbols-outlined">sentiment_satisfied</span>
            </button>
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendReply()}
              placeholder="Digite uma mensagem..."
              className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-400 text-white placeholder-white/50 text-sm"
              disabled={sending}
            />
            <button
              onClick={handleSendReply}
              disabled={sending || !replyText.trim()}
              className="p-2 bg-[#005c4b] text-white rounded-full hover:bg-[#004d3e] disabled:bg-white/20 disabled:cursor-not-allowed transition-colors"
            >
              {sending ? (
                <span className="material-symbols-outlined animate-spin">hourglass_empty</span>
              ) : (
                <span className="material-symbols-outlined">send</span>
              )}
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
