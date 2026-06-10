import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import raissaAvatar from '../assets/raissa-avatar.png';

const WelcomeModal = ({ onClose }) => {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Verificar se deve mostrar o modal
    const shouldShowModal = () => {
      // Verificar se é Raíssa
      if (user?.userType !== 'raissa') return false;

      // Verificar se é dia 12 de junho ou posterior
      const today = new Date();
      const startDate = new Date('2026-06-09');
      if (today < startDate) return false;

      // Verificar se já viu a mensagem
      const hasSeenWelcome = localStorage.getItem('raissaWelcomeSeen');
      if (hasSeenWelcome) return false;

      return true;
    };

    if (shouldShowModal()) {
      setIsVisible(true);
      // Iniciar animação após um pequeno delay
      setTimeout(() => setIsAnimating(true), 100);
    }
  }, [user]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      // Marcar que Raíssa já viu a mensagem
      try {
        localStorage.setItem('raissaWelcomeSeen', 'true');
      } catch (error) {
        console.error('Erro ao salvar estado de boas-vindas:', error);
      }
      if (onClose) onClose();
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/80 via-pink-900/80 to-red-900/80 backdrop-blur-sm"></div>
      
      <div
        className={`relative bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-2xl border border-white/20 rounded-3xl p-5 shadow-2xl w-full max-w-md transform transition-all duration-500 ${
          isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Confetes decorativos */}
        <div className="absolute -top-3 -left-3 text-4xl animate-bounce">🎉</div>
        <div className="absolute -top-3 -right-3 text-4xl animate-bounce" style={{ animationDelay: '0.2s' }}>🎊</div>
        <div className="absolute -bottom-3 -left-3 text-4xl animate-bounce" style={{ animationDelay: '0.4s' }}>💖</div>
        <div className="absolute -bottom-3 -right-3 text-4xl animate-bounce" style={{ animationDelay: '0.6s' }}>✨</div>

        {/* Avatar */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden border-3 border-pink-500/50 shadow-xl">
              <img
                src={raissaAvatar}
                alt="Raíssa"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-pink-500 rounded-full p-1.5">
              <span className="material-symbols-outlined text-white text-lg">favorite</span>
            </div>
          </div>
        </div>

        {/* Título */}
        <h1 className="text-2xl font-bold text-center mb-3 bg-gradient-to-r from-pink-400 via-purple-400 to-red-400 bg-clip-text text-transparent">
          🎁 Presente Especial
        </h1>

        {/* Mensagem */}
        <div className="space-y-2 text-white/90 text-center mb-4">
          <p className="text-sm font-semibold">
            Minha querida Raíssa,
          </p>
          <p className="text-xs leading-relaxed">
            Este app foi feito com todo meu amor para você. Cada detalhe foi pensado para nossa jornada juntos.
          </p>
          <p className="text-xs leading-relaxed">
            Músicas, mensagens, fotos e muito mais para celebrar nosso amor.
          </p>
          <p className="text-sm font-semibold text-pink-300">
            Te amo! 💕
          </p>
        </div>

        {/* Funcionalidades destacadas */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="bg-white/5 rounded-lg p-2 text-center border border-white/10">
            <span className="material-symbols-outlined text-pink-400 text-lg">chat_bubble</span>
            <p className="text-white/80 text-[10px] mt-0.5">Mensagens</p>
          </div>
          <div className="bg-white/5 rounded-lg p-2 text-center border border-white/10">
            <span className="material-symbols-outlined text-purple-400 text-lg">music_note</span>
            <p className="text-white/80 text-[10px] mt-0.5">Músicas</p>
          </div>
          <div className="bg-white/5 rounded-lg p-2 text-center border border-white/10">
            <span className="material-symbols-outlined text-red-400 text-lg">photo_library</span>
            <p className="text-white/80 text-[10px] mt-0.5">Fotos</p>
          </div>
          <div className="bg-white/5 rounded-lg p-2 text-center border border-white/10">
            <span className="material-symbols-outlined text-blue-400 text-lg">map</span>
            <p className="text-white/80 text-[10px] mt-0.5">Mapa</p>
          </div>
        </div>

        {/* Botão */}
        <button
          onClick={handleClose}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-red-500 text-white font-semibold text-sm hover:opacity-90 transition-all transform hover:scale-105 shadow-lg"
        >
          Começar Nossa Jornada 💖
        </button>

        {/* Data */}
        <p className="text-center text-white/40 text-[10px] mt-3">
          12 de Junho de 2026
        </p>
      </div>
    </div>
  );
};

export default WelcomeModal;
