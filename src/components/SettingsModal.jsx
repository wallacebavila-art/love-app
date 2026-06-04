import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useLoginModal } from '../contexts/LoginModalContext';
import { useDarkMode } from '../contexts/DarkModeContext';
import { useTheme } from '../contexts/ThemeContext';
import { clearAllNotifications } from '../services/realtimeNotifications';
import { useToast } from './Toast';
import naocliqueImage from '/naoclique.png';
import { logger } from '../utils/logger';
import raissaAvatar from '/favicon.png';

const SettingsModal = ({ isOpen, onClose, onOpenYoutubeDownloader }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { setIsLoginModalOpen } = useLoginModal();
  const { isDarkMode, isExplicitMode, toggleDarkMode, enableExplicitMode, disableExplicitMode } = useDarkMode();
  const { getCardBackground, getBorderColor, getTextColor } = useTheme();
  const { success, error } = useToast();
  const [showSecretImage, setShowSecretImage] = useState(false);
  const [secretStep, setSecretStep] = useState(0);
  const [useLoveName, setUseLoveName] = useState(false);
  const [isClearingChat, setIsClearingChat] = useState(false);

  useEffect(() => {
    // Carregar preferência do localStorage
    const saved = localStorage.getItem('useLoveName');
    if (saved) {
      try {
        setUseLoveName(JSON.parse(saved));
      } catch (error) {
        logger.error('Erro ao fazer parse de useLoveName:', error);
      }
    }

    // Ouvir evento de toggle
    const handleToggle = (e) => {
      setUseLoveName(e.detail);
    };

    window.addEventListener('loveNameToggled', handleToggle);
    return () => window.removeEventListener('loveNameToggled', handleToggle);
  }, []);

  const handleLogin = () => {
    onClose();
    setIsLoginModalOpen(true);
  };

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
      navigate('/');
    } catch (error) {
      logger.error('Erro ao fazer logout:', error);
    }
  };

  const handleSecretClick = () => {
    if (secretStep < 3) {
      setSecretStep(secretStep + 1);
    } else {
      setShowSecretImage(true);
      setSecretStep(0);
    }
  };

  const getSecretText = () => {
    switch (secretStep) {
      case 0:
        return 'Não clique';
      case 1:
        return 'Por favor, não clique';
      case 2:
        return `${useLoveName ? 'Amor' : 'Raíssa'}, não é para clicar aqui`;
      case 3:
        return '...';
      default:
        return 'Não clique';
    }
  };

  const handleClearChat = async () => {
    if (!confirm('Tem certeza que deseja limpar todo o histórico do chat? Esta ação não pode ser desfeita.')) {
      return;
    }
    
    setIsClearingChat(true);
    try {
      const clearSuccess = await clearAllNotifications();
      if (clearSuccess) {
        success('Histórico do chat limpo com sucesso!');
      } else {
        error('Erro ao limpar histórico do chat');
      }
    } catch (error) {
      logger.error('Erro ao limpar chat:', error);
      error('Erro ao limpar histórico do chat');
    } finally {
      setIsClearingChat(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className={`relative ${getCardBackground()} backdrop-blur-[24px] -webkit-backdrop-blur-[24px] border-2 ${getBorderColor()} rounded-3xl w-full max-w-sm max-h-[80vh] overflow-hidden flex flex-col shadow-2xl shadow-black/10`}>
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-[24px] -webkit-backdrop-blur-[24px] border-b border-white/20 px-4 py-3 flex justify-between items-center">
          <h2 className={`text-lg font-bold ${getTextColor()}`}>Configurações</h2>
          <button
            onClick={onClose}
            className={`${getTextColor()} hover:bg-white/20 rounded-full p-1 transition`}
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
          {/* User Section */}
          <div className="mb-4">
            <h3 className={`text-sm font-semibold ${getTextColor()} mb-2`}>Conta</h3>
            {user ? (
              <div className={`p-3 bg-white/10 rounded-lg border ${getBorderColor()}`}>
                <div className="flex items-center gap-2 mb-2">
                  {user.userType === 'raissa' ? (
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                      <img
                        src={raissaAvatar}
                        alt={useLoveName ? 'Amor' : 'Raíssa'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-white">person</span>
                    </div>
                  )}
                  <div>
                    <p className={`font-semibold ${getTextColor()} text-sm`}>
                      {user.userType === 'raissa' ? (useLoveName ? 'Amor' : 'Raíssa') : 'Administrador'}
                    </p>
                    {user.userType !== 'raissa' && (
                      <p className="text-xs text-white/60">{user.email}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full bg-red-500/80 text-white py-1.5 rounded-lg hover:bg-red-500 transition font-semibold flex items-center justify-center gap-2 text-sm"
                >
                  <span className="material-symbols-outlined text-sm">logout</span>
                  Sair
                </button>
              </div>
            ) : (
              <div className={`p-3 bg-white/10 rounded-lg border ${getBorderColor()}`}>
                <p className="text-white/60 text-center mb-2 text-xs">Faça login para acessar funcionalidades administrativas</p>
                <button
                  onClick={handleLogin}
                  className="w-full bg-white/20 text-white py-1.5 rounded-lg hover:bg-white/30 transition font-semibold flex items-center justify-center gap-2 text-sm"
                >
                  <span className="material-symbols-outlined text-sm">login</span>
                  Fazer Login
                </button>
              </div>
            )}
          </div>

          {/* App Info Section */}
          <div className="mb-4">
            <h3 className={`text-sm font-semibold ${getTextColor()} mb-2`}>Aparência</h3>
            <div className="space-y-2">
              <div className={`flex justify-between items-center p-2 bg-white/10 rounded-lg border ${getBorderColor()}`}>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-white/60 text-sm">dark_mode</span>
                  <span className="text-white/80 text-sm">Modo Escuro</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={isExplicitMode ? disableExplicitMode : enableExplicitMode}
                    className="text-xs text-white/60 hover:text-white/80 font-medium"
                  >
                    {isExplicitMode ? 'Auto' : 'Manual'}
                  </button>
                  <button
                    onClick={() => {
                      if (!isExplicitMode) enableExplicitMode();
                      toggleDarkMode();
                    }}
                    className={`w-14 h-7 rounded-full transition-colors border-2 ${
                      isDarkMode ? 'bg-white/40 border-white/50' : 'bg-white/30 border-white/40'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      isDarkMode ? 'translate-x-7' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* App Info Section */}
          <div className="mb-4">
            <h3 className={`text-sm font-semibold ${getTextColor()} mb-2`}>Sobre</h3>
            <div className="space-y-1">
              <div className={`flex justify-between items-center p-2 bg-white/10 rounded-lg border ${getBorderColor()}`}>
                <span className="text-white/60 text-xs">Versão</span>
                <span className="text-white font-medium text-xs">1.0.0</span>
              </div>
              <div className={`flex justify-between items-center p-2 bg-white/10 rounded-lg border ${getBorderColor()}`}>
                <span className="text-white/60 text-xs">Desenvolvido para</span>
                <span className="text-white font-medium text-xs">Raíssa 💕</span>
              </div>
            </div>
          </div>

          {/* Baixar Música do YouTube - Visível apenas para admin */}
          {user?.userType === 'admin' && (
            <div className={`mt-4 pt-4 border-t ${getBorderColor()}`}>
              <button
                onClick={onOpenYoutubeDownloader}
                className="w-full bg-white/20 text-white py-2 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-white/30 transition-all active:scale-[0.98] shadow-md text-sm"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                Baixar Música
              </button>
            </div>
          )}

          {/* Limpar Histórico - Visível apenas para admin */}
          {user?.userType === 'admin' && (
            <div className={`mt-4 pt-4 border-t ${getBorderColor()}`}>
              <button
                onClick={handleClearChat}
                disabled={isClearingChat}
                className="w-full bg-red-500/80 text-white py-2 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-red-500 transition-all active:scale-[0.98] shadow-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-sm">delete</span>
                {isClearingChat ? 'Limpando...' : 'Limpar Histórico do Chat'}
              </button>
            </div>
          )}

          {/* Secret Box */}
          <div className="mt-4">
            <button
              onClick={handleSecretClick}
              className={`w-full p-2 bg-white/10 rounded-lg border ${getBorderColor()} hover:bg-white/20 transition text-white/40 text-xs font-medium cursor-pointer`}
            >
              {getSecretText()}
            </button>
          </div>
        </div>
      </div>

      {/* Secret Image Modal */}
      {showSecretImage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowSecretImage(false)}></div>
          <div className="relative max-w-2xl w-full overflow-hidden">
            <button
              onClick={() => setShowSecretImage(false)}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/80 hover:bg-white transition-all hover:scale-110 z-10"
            >
              <span className="material-symbols-outlined text-gray-800 text-[20px]">close</span>
            </button>
            <div className="p-4">
              <img
                src={naocliqueImage}
                alt="Surpresa"
                className="w-[70%] h-auto rounded-lg mx-auto"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="20" fill="%239ca3af"%3EImagem não encontrada%3C/text%3E%3C/svg%3E';
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsModal;
