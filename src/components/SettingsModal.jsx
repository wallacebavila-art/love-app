import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useLoginModal } from '../contexts/LoginModalContext';
import { useTimePeriod } from '../contexts/TimePeriodContext';
import YoutubeDownloader from './YoutubeDownloader';
import naocliqueImage from '/naoclique.png';
import raissaAvatar from '/favicon.png';

const SettingsModal = ({ isOpen, onClose }) => {
  const [showDownloader, setShowDownloader] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { setIsLoginModalOpen } = useLoginModal();
  const { period, setManualPeriod, resetToAuto, isManualMode } = useTimePeriod();
  const [showSecretImage, setShowSecretImage] = useState(false);
  const [secretStep, setSecretStep] = useState(0);
  const [useLoveName, setUseLoveName] = useState(false);

  useEffect(() => {
    // Carregar preferência do localStorage
    const saved = localStorage.getItem('useLoveName');
    if (saved) {
      setUseLoveName(JSON.parse(saved));
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
      console.error('Erro ao fazer logout:', error);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Configurações</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* User Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Conta</h3>
            {user ? (
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-3 mb-3">
                  {user.userType === 'raissa' ? (
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                      <img
                        src={raissaAvatar}
                        alt={useLoveName ? 'Amor' : 'Raíssa'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-white">person</span>
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-800">
                      {user.userType === 'raissa' ? (useLoveName ? 'Amor' : 'Raíssa') : 'Administrador'}
                    </p>
                    {user.userType !== 'raissa' && (
                      <p className="text-sm text-gray-600">{user.email}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition font-semibold flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">logout</span>
                  Sair
                </button>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-600 text-center mb-3">Faça login para acessar funcionalidades administrativas</p>
                <button
                  onClick={handleLogin}
                  className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition font-semibold flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">login</span>
                  Fazer Login
                </button>
              </div>
            )}
          </div>

          {/* App Info Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Sobre</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Versão</span>
                <span className="text-gray-800 font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Desenvolvido para</span>
                <span className="text-gray-800 font-medium">Raíssa 💕</span>
              </div>
            </div>
          </div>

          {/* Time Period Test Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Testar Período do Dia</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Período atual</span>
                <span className="text-gray-800 font-medium capitalize">{period}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Modo</span>
                <span className={`text-sm font-medium ${isManualMode ? 'text-orange-600' : 'text-green-600'}`}>
                  {isManualMode ? 'Manual' : 'Automático'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3">
                <button
                  onClick={() => setManualPeriod('morning')}
                  className={`p-2 rounded-lg text-sm font-medium transition ${
                    period === 'morning' && isManualMode
                      ? 'bg-yellow-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  🌅 Manhã
                </button>
                <button
                  onClick={() => setManualPeriod('afternoon')}
                  className={`p-2 rounded-lg text-sm font-medium transition ${
                    period === 'afternoon' && isManualMode
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  ☀️ Tarde
                </button>
                <button
                  onClick={() => setManualPeriod('night')}
                  className={`p-2 rounded-lg text-sm font-medium transition ${
                    period === 'night' && isManualMode
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  🌙 Noite
                </button>
              </div>
              {isManualMode && (
                <button
                  onClick={resetToAuto}
                  className="w-full mt-2 p-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition"
                >
                  ↩️ Voltar para Automático
                </button>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              ~para Raíssa. Com amor, Wallace. 💕
            </p>
          </div>

          {/* Baixar Música do YouTube - Visível apenas para admin */}
          {user?.userType === 'admin' && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => setShowDownloader(!showDownloader)}
                className="w-full bg-gradient-to-r from-red-500 to-purple-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-red-600 hover:to-purple-700 transition-all active:scale-[0.98] shadow-md shadow-red-500/20"
              >
                <span className="material-symbols-outlined">download</span>
                {showDownloader ? 'Fechar Downloader' : 'Baixar Música do YouTube'}
              </button>
            </div>
          )}

          {showDownloader && (
            <div className="mt-4">
              <YoutubeDownloader onClose={() => setShowDownloader(false)} />
            </div>
          )}

          {/* Secret Box */}
          <div className="mt-4">
            <button
              onClick={handleSecretClick}
              className="w-full p-3 bg-gray-100 rounded-lg border border-gray-200 hover:bg-gray-200 transition text-gray-400 text-sm font-medium cursor-pointer"
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
