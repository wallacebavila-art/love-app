import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import raissaAvatar from '../assets/raissa-avatar.png';

const WelcomeModal = ({ onClose }) => {
  const { user } = useAuth();
  const { getCardBackground, getBorderColor, getTextColor, period } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  // Conteúdo do tour
  const tourPages = [
    {
      title: "Bom dia, Amor! 💕",
      icon: "favorite",
      iconColor: "text-pink-400",
      description: "Esse app foi feito para você ter tudo o que precisa para começar seu dia. Cada funcionalidade foi pensada com muito amor para você.",
      showAvatar: true,
    },
    {
      title: "Mensagens",
      icon: "chat_bubble",
      iconColor: "text-pink-400",
      description: "Aqui você encontra o chat de conversa com seu amor. Use para fofocar, ter conversas sérias ou mandar seus 10 minutos de áudio!!!",
      example: "💬 Clique no ícone de mensagens para ler suas mensagens com o amor da sua vida",
    },
    {
      title: "Músicas",
      icon: "music_note",
      iconColor: "text-purple-400",
      description: "Playlists selecionadas com as músicas que minha copiloto mais ouve. Perfeitas para qualquer momento do seu dia.",
      example: "🎵 Ouça enquanto trabalha, estuda, treina ou faz outras coisas....",
    },
    {
      title: "Nossas Fotos",
      icon: "photo_library",
      iconColor: "text-red-400",
      description: "Todos os nossos momentos especiais guardados aqui. Sempre será atualizado com novos momentos.",
      example: "📸 Veja nossos melhores momentos e aprecie o quanto seu namorado é lindo",
    },
    {
      title: "Mapa de Viagens",
      icon: "map",
      iconColor: "text-blue-400",
      description: "Lugares que visitamos juntos e que ainda vamos conhecer. Marque novos lugares ou onde já visitamos.",
      example: "🗺️ Marque novos destinos para explorarmos",
    },
    {
      title: "Mensagem do Dia",
      icon: "mail",
      iconColor: "text-orange-400",
      description: "Uma mensagem especial escrita especialmente para você, todos os dias.",
      example: "💌 Leia sua mensagem do dia para começar com amor",
    },
    {
      title: "Versículos Diários",
      icon: "menu_book",
      iconColor: "text-yellow-400",
      description: "Versículos para começar seu dia com o coração cheio de paz e motivação.",
      example: "📖 Leia o versículo do dia para se inspirar",
    },
    {
      title: "Calendário",
      icon: "calendar_month",
      iconColor: "text-green-400",
      description: "Datas importantes e momentos que marcaram nossa história.",
      example: "📅 Lembre das nossas datas do calendário",
    },
    {
      title: "Clima do Dia",
      icon: "cloud",
      iconColor: "text-cyan-400",
      description: "Saiba como está o tempo para planejar seu dia. Sempre preparada para qualquer situação.",
      example: "🌤️ Veja o clima antes de sair de casa",
    },
    {
      title: "Pronto para Começar!",
      icon: "favorite",
      iconColor: "text-pink-400",
      description: "Agora você conhece tudo que preparei para você. Espero que ame cada detalhe desse app feito com muito amor!",
      isFinal: true,
    },
  ];

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

  const handleNext = () => {
    if (currentPage < tourPages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (!isVisible) return null;

  const currentPageData = tourPages[currentPage];
  const isLastPage = currentPage === tourPages.length - 1;
  const isFirstPage = currentPage === 0;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      
      <div
        className={`relative ${getCardBackground()} backdrop-blur-2xl ${getBorderColor()} rounded-3xl p-5 shadow-2xl w-full max-w-lg transform transition-all duration-500 ${
          isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Confetes decorativos (apenas na primeira página) */}
        {isFirstPage && (
          <>
            <div className="absolute -top-3 -left-3 text-4xl animate-bounce">🎉</div>
            <div className="absolute -top-3 -right-3 text-4xl animate-bounce" style={{ animationDelay: '0.2s' }}>🎊</div>
            <div className="absolute -bottom-3 -left-3 text-4xl animate-bounce" style={{ animationDelay: '0.4s' }}>💖</div>
            <div className="absolute -bottom-3 -right-3 text-4xl animate-bounce" style={{ animationDelay: '0.6s' }}>✨</div>
          </>
        )}

        {/* Avatar (apenas na primeira página) */}
        {currentPageData.showAvatar && (
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
        )}

        {/* Ícone grande da funcionalidade (exceto primeira página) */}
        {!currentPageData.showAvatar && (
          <div className="flex justify-center mb-4">
            <div className={`w-20 h-20 rounded-full bg-white/10 flex items-center justify-center ${currentPageData.iconColor}`}>
              <span className="material-symbols-outlined text-5xl">{currentPageData.icon}</span>
            </div>
          </div>
        )}

        {/* Indicador de progresso */}
        <div className="flex justify-center gap-2 mb-4">
          {tourPages.map((_, index) => (
            <div
              key={index}
              className={`h-1 rounded-full transition-all ${
                index === currentPage ? 'bg-pink-500 w-8' : 'bg-white/30 w-2'
              }`}
            />
          ))}
        </div>

        {/* Título */}
        <h1 className={`text-2xl font-bold text-center mb-3 ${getTextColor()} ${
          !currentPageData.showAvatar ? 'text-3xl' : ''
        }`}>
          {currentPageData.title}
        </h1>

        {/* Descrição */}
        <div className={`space-y-2 ${getTextColor()}/90 text-center mb-4`}>
          <p className="text-sm leading-relaxed">
            {currentPageData.description}
          </p>
          {currentPageData.example && (
            <p className="text-xs text-pink-300 italic mt-2">
              {currentPageData.example}
            </p>
          )}
        </div>

        {/* Botões de navegação */}
        {!isLastPage ? (
          <div className="flex gap-3 mb-3">
            {!isFirstPage && (
              <button
                onClick={handlePrevious}
                className="flex-1 py-3 rounded-xl bg-white/10 text-white font-semibold text-sm hover:bg-white/20 transition-all border border-white/20"
              >
                ← Anterior
              </button>
            )}
            <button
              onClick={handleNext}
              className={`flex-1 py-3 rounded-xl bg-white/20 text-white font-semibold text-sm hover:bg-white/30 transition-all border border-white/30 ${
                isFirstPage ? 'w-full' : ''
              }`}
            >
              Próximo →
            </button>
          </div>
        ) : (
          <div className="flex gap-3 mb-3">
            <button
              onClick={handlePrevious}
              className="py-3 px-6 rounded-xl bg-white/10 text-white font-semibold text-sm hover:bg-white/20 transition-all border border-white/20"
            >
              ← Anterior
            </button>
            <button
              onClick={handleClose}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-6 rounded-full bg-gradient-to-r from-white/20 to-white/30 text-white font-semibold text-sm hover:from-white/30 hover:to-white/40 transition-all transform hover:scale-105 shadow-lg border-2 border-white/40 backdrop-blur-sm"
            >
              <span className="material-symbols-outlined text-lg animate-pulse">favorite</span>
              <span>Entrar no meu app</span>
            </button>
          </div>
        )}

        {/* Data (apenas na primeira página) */}
        {isFirstPage && (
          <p className="text-center text-white/40 text-[10px] mt-3">
            12 de Junho de 2026
          </p>
        )}
      </div>
    </div>
  );
};

export default WelcomeModal;
