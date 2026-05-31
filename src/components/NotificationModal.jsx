import { useNotifications } from './NotificationToast';
import { useState, useEffect, useRef } from 'react';
import { sendRealtimeNotification } from '../services/realtimeNotifications';
import { uploadAudioToStorage } from '../services/photoService';
import { useTimePeriod } from '../contexts/TimePeriodContext';
import { useAuth } from '../contexts/AuthContext';
import raissaAvatar from '../assets/raissa-avatar.png';
import wallaceAvatar from '../assets/wallace-avatar.png';
import AudioPlayer from './AudioPlayer';

const EMOJI_CATEGORIES = [
  {
    name: 'Carinhas',
    icon: '😊',
    emojis: ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '🤗', '🤩', '😛', '😜', '😝', '🤑', '🤪', '😎', '🤓', '🥳', '😏', '😒', '🙄', '😤', '😢', '😭', '😩', '🥺', '😡', '🤬', '💀', '👻']
  },
  {
    name: 'Corações',
    icon: '❤️',
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💕', '💞', '💗', '💖', '💘', '💝', '❣️', '💟', '🫶']
  },
  {
    name: 'Gestos',
    icon: '👍',
    emojis: ['👍', '👎', '👊', '✊', '🤛', '🤜', '👏', '🙌', '🤝', '🙏', '✌️', '🤘', '🤙', '💪', '🖕', '👋', '🤚', '🖐️', '✋', '👌', '🤌', '🤏', '💅', '🫶']
  },
  {
    name: 'Símbolos',
    icon: '🔥',
    emojis: ['🔥', '⭐', '✨', '💫', '🌟', '💥', '💯', '✅', '❌', '💢', '💤', '💦', '💨', '🎉', '🎊', '🎈', '🎀', '🎁', '🏆', '👑', '💎', '🔮', '💡', '🕯️', '🌹', '🌺', '🌸', '🌻', '🌞', '🌈', '☀️', '🌙', '⭐', '🪐']
  },
  {
    name: 'Comida',
    icon: '🍕',
    emojis: ['🍕', '🍔', '🌭', '🥪', '🌮', '🌯', '🥗', '🍿', '🥨', '🥯', '🍞', '🧀', '🥚', '🍳', '🥓', '🧇', '🥞', '🍦', '🍩', '🍪', '🎂', '🍫', '🍬', '🍭', '🧁', '🍉', '🍓', '🍇', '🍊', '🍋', '🍌', '🍎', '🍑', '🍒', '☕', '🧃', '🥤']
  }
];

const NotificationModal = ({ isOpen, onClose }) => {
  const { notifications } = useNotifications();
  const { period } = useTimePeriod();
  const { user } = useAuth();
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiCategory, setEmojiCategory] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState(null);
  const messagesEndRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordingIntervalRef = useRef(null);

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

  // Renderizar texto separando emojis (maiores) do texto normal
  const renderMessageContent = (text) => {
    const emojiRegex = /(\p{Emoji_Presentation}|\p{Extended_Pictographic})/gu;
    const parts = text.split(emojiRegex);
    return parts.map((part, i) => {
      if (emojiRegex.test(part)) {
        return <span key={i} className="text-2xl">{part}</span>;
      }
      return part;
    });
  };

  const handleEmojiClick = (emoji) => {
    setReplyText(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleSendReply = async () => {
    if (!replyText.trim() && !recordedAudioBlob) return;

    setSending(true);
    try {
      let audioUrl = null;

      // Se houver áudio gravado, fazer upload
      if (recordedAudioBlob) {
        const fileName = `${Date.now()}_recording.webm`;
        audioUrl = await uploadAudioToStorage(recordedAudioBlob, fileName);
        if (!audioUrl) {
          alert('Erro ao fazer upload do áudio');
          setSending(false);
          return;
        }
      }

      const success = await sendRealtimeNotification('Resposta', replyText, user?.userType || 'raissa', audioUrl);
      if (success) {
        setReplyText('');
        setRecordedAudioBlob(null);
        setRecordingTime(0);
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

  // Lógica de gravação de áudio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      const chunks = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setRecordedAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Erro ao acessar microfone:', error);
      alert('Erro ao acessar microfone. Verifique as permissões.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordingIntervalRef.current);
    }
  };

  const formatRecordingTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [notifications, isOpen]);

  // Fechar emoji picker ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className={`relative ${getCardBackground()} backdrop-blur-[24px] -webkit-backdrop-blur-[24px] border ${getBorderColor()} rounded-[32px] shadow-2xl shadow-black/10 w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col mb-16 md:mb-0`}>
        <div className={`px-6 py-2 flex justify-between items-center border-b ${getBorderColor()}`}>
          <h2 className={`text-xl font-bold ${getTextColor()}`}>Fofocas</h2>
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
                  <div className="w-10 h-10 rounded-full mr-3 flex-shrink-0 overflow-hidden">
                    {notification.sender === 'raissa' ? (
                      <img src={raissaAvatar} alt="Raíssa" className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <img src={wallaceAvatar} alt="Wallace" className="w-full h-full object-cover rounded-full" />
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
                    {notification.body && (
                      <p className={`text-sm ${notification.sender === user?.userType ? 'text-white' : 'text-gray-800'}`}>
                        {renderMessageContent(notification.body)}
                      </p>
                    )}
                    {notification.audioUrl && (
                      <AudioPlayer
                        audioUrl={notification.audioUrl}
                        isSent={notification.sender === user?.userType}
                      />
                    )}
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
                  <div className="w-10 h-10 rounded-full ml-3 flex-shrink-0 overflow-hidden">
                    {notification.sender === 'raissa' ? (
                      <img src={raissaAvatar} alt="Raíssa" className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <img src={wallaceAvatar} alt="Wallace" className="w-full h-full object-cover rounded-full" />
                    )}
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-3 border-t border-white/20 bg-white/5 relative">
          <div className="flex gap-2 items-center">
            <div className="relative" ref={emojiPickerRef}>
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 text-white/60 hover:text-white transition"
              >
                <span className="material-symbols-outlined">sentiment_satisfied</span>
              </button>
              {showEmojiPicker && (
                <div className="absolute bottom-14 left-0 z-20 bg-gray-900/95 backdrop-blur-xl border border-white/15 rounded-2xl shadow-2xl w-[260px] overflow-hidden">
                  {/* Categorias */}
                  <div className="flex gap-1 px-2 pt-2 pb-1 border-b border-white/10">
                    {EMOJI_CATEGORIES.map((cat, idx) => (
                      <button
                        key={idx}
                        onClick={() => setEmojiCategory(idx)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-all ${
                          idx === emojiCategory
                            ? 'bg-white/20 scale-110'
                            : 'hover:bg-white/10'
                        }`}
                      >
                        {cat.icon}
                      </button>
                    ))}
                  </div>
                  {/* Grid de Emojis */}
                  <div className="p-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-6 gap-1">
                      {EMOJI_CATEGORIES[emojiCategory].emojis.map((emoji, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleEmojiClick(emoji)}
                          className="w-10 h-10 flex items-center justify-center text-2xl hover:bg-white/10 rounded-xl transition-colors"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendReply()}
              placeholder="Digite uma mensagem..."
              className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-400 text-white placeholder-white/50 text-sm"
              disabled={sending}
            />
            <div className="flex gap-2 items-center">
              {!isRecording && !recordedAudioBlob && (
                <button
                  onClick={startRecording}
                  className="p-2 text-white/60 hover:text-red-400 transition"
                  title="Gravar áudio"
                >
                  <span className="material-symbols-outlined">mic</span>
                </button>
              )}
              {isRecording && (
                <button
                  onClick={stopRecording}
                  className="p-2 text-red-400 hover:text-red-300 transition"
                  title="Parar gravação"
                >
                  <span className="material-symbols-outlined">stop_circle</span>
                </button>
              )}
              {isRecording && (
                <span className="text-white font-mono text-xs">
                  {formatRecordingTime(recordingTime)}
                </span>
              )}
              {recordedAudioBlob && (
                <button
                  onClick={() => setRecordedAudioBlob(null)}
                  className="p-2 text-white/60 hover:text-red-400 transition"
                  title="Apagar áudio"
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
              )}
            </div>
            <button
              onClick={handleSendReply}
              disabled={sending || (!replyText.trim() && !recordedAudioBlob)}
              className="p-2 bg-[#005c4b] text-white rounded-full hover:bg-[#004d3e] disabled:bg-white/20 disabled:cursor-not-allowed transition-colors"
            >
              {sending ? (
                <span className="material-symbols-outlined animate-spin">hourglass_empty</span>
              ) : (
                <span className="material-symbols-outlined">send</span>
              )}
            </button>
          </div>
          {recordedAudioBlob && (
            <div className="px-3 pb-2">
              <audio
                controls
                className="w-full h-8"
                src={URL.createObjectURL(recordedAudioBlob)}
              />
              <p className="text-xs text-white/60 mt-1">
                Duração: {formatRecordingTime(recordingTime)}
              </p>
            </div>
          )}
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.35);
        }
      `}</style>
    </div>
  );
};

export default NotificationModal;