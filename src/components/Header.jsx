import { getGreeting } from '../utils/dateUtils';
import { useTimePeriod } from '../contexts/TimePeriodContext';
import { fetchWeather } from '../services/weatherService';
import { useState, useEffect, useRef } from 'react';
import SideMenu from './SideMenu';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from './NotificationToast';
import NotificationModal from './NotificationModal';
import { useLoginModal } from '../contexts/LoginModalContext';
import TravelMapModal from './TravelMapModal';
import raissaAvatar from '../assets/raissa-avatar.png';
import wallaceAvatar from '../assets/wallace-avatar.png';
const Header = ({ onOpenCalendar, onOpenWeather, onOpenAdmin, onOpenSettings, onOpenICloudCalendar, onOpenTravelMap, onOpenMusicPlayer, isPlaying, onToggleMusic, onNextTrack, onPrevTrack, toggleShuffle, isShuffled, musicMode, toggleMusicMode, volume, onVolumeChange, currentTrack, currentArtist }) => {
  const { period } = useTimePeriod();
  const { user } = useAuth();
  const navigate = useNavigate();
  const greeting = getGreeting();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [weather, setWeather] = useState(null);
  const [useLoveName, setUseLoveName] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [showRaissaMessage, setShowRaissaMessage] = useState(false);
  const [isTravelMapOpen, setIsTravelMapOpen] = useState(false);
  const { notifications, setNotifications, lastViewedTimestamp, setLastViewedTimestamp } = useNotifications();
  const { setIsRaissaLoginModalOpen } = useLoginModal();
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const volumeRef = useRef(null);

  // Fechar volume slider ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (volumeRef.current && !volumeRef.current.contains(event.target)) {
        setShowVolumeSlider(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Atalho de teclado: Espaço para play/pause
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Não ativar se estiver digitando em um input
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;
      if (event.code === 'Space') {
        event.preventDefault();
        onToggleMusic();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToggleMusic]);

  // Tooltip: mostrar nome da música ao passar o mouse
  const handleMouseEnter = () => {
    if (currentTrack) {
      tooltipTimeoutRef.current = setTimeout(() => setShowTrackTooltip(true), 500);
    }
  };
  const handleMouseLeave = () => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
    setShowTrackTooltip(false);
  };

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

  const toggleLoveName = () => {
    const newValue = !useLoveName;
    setUseLoveName(newValue);
    localStorage.setItem('useLoveName', JSON.stringify(newValue));
    window.dispatchEvent(new CustomEvent('loveNameToggled', { detail: newValue }));
  };

  useEffect(() => {
    const loadWeather = async () => {
      const weatherData = await fetchWeather();
      setWeather(weatherData);
    };
    loadWeather();
  }, []);

  // Formatar data completa
  const getFullDate = () => {
    const today = new Date();
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return today.toLocaleDateString('pt-BR', options);
  };

  const getIcon = () => {
    switch (period) {
      case 'morning':
        return 'light_mode';
      case 'afternoon':
        return 'wb_sunny';
      case 'night':
        return 'nightlight_round';
      default:
        return 'light_mode';
    }
  };

  const getIconColor = () => {
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

  // Calcular notificações não visualizadas (ignorando as enviadas por mim)
  const getUnreadCount = () => {
    if (!lastViewedTimestamp) return notifications.filter(n => n.sender !== user?.userType).length;
    return notifications.filter(n => {
      if (n.sender === user?.userType) return false;
      const timestamp = n.timestamp instanceof Date ? n.timestamp.getTime() : new Date(n.timestamp).getTime();
      return timestamp > lastViewedTimestamp;
    }).length;
  };

  return (
    <>
      <header className="w-full pt-3 pb-2 flex justify-between items-center px-4 md:px-8">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className={`material-symbols-outlined ${getIconColor} icon-glow transition-transform duration-300 hover:scale-110 cursor-pointer`} style={{ fontVariationSettings: 'FILL 1' }}>
              {getIcon()}
            </span>
            <h1 className={`font-headline-lg-mobile ${getTextColor} italic transition-all duration-300 hover:scale-105 cursor-default text-[20px]`}>
              {greeting}, {useLoveName ? 'Amor' : 'Raíssa'}
            </h1>
            <div className="flex items-center gap-0.5 relative hidden md:flex">
              <span className={`${getTextColor} p-0.5 flex items-center relative`}>
                <span className="material-symbols-outlined text-[18px]">music_note</span>
                {isPlaying && (
                  <span className="absolute -top-0.5 -right-0.5 flex gap-[1px]">
                    <span className="w-[2px] h-2.5 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '0.6s' }}></span>
                    <span className="w-[2px] h-1.5 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s', animationDuration: '0.8s' }}></span>
                    <span className="w-[2px] h-3 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s', animationDuration: '0.5s' }}></span>
                    <span className="w-[2px] h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s', animationDuration: '0.7s' }}></span>
                    <span className="w-[2px] h-2.5 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s', animationDuration: '0.9s' }}></span>
                  </span>
                )}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); onPrevTrack(); }}
                className={`${getTextColor} transition-all duration-300 hover:scale-110 active:scale-95 p-0.5 rounded-full`}
                title="Música anterior"
              >
                <span className="material-symbols-outlined text-[16px]">skip_previous</span>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onToggleMusic(); }}
                className={`${getTextColor} transition-all duration-300 hover:scale-110 active:scale-95 p-0.5 rounded-full`}
                title={isPlaying ? 'Pausar música (espaço)' : 'Tocar música (espaço)'}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {isPlaying ? 'pause' : 'play_arrow'}
                </span>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onNextTrack(); }}
                className={`${getTextColor} transition-all duration-300 hover:scale-110 active:scale-95 p-0.5 rounded-full`}
                title="Próxima música"
              >
                <span className="material-symbols-outlined text-[16px]">skip_next</span>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); toggleShuffle && toggleShuffle(); }}
                className={`transition-all duration-300 hover:scale-110 active:scale-95 p-0.5 rounded-full ${
                  isShuffled ? 'text-green-400' : getTextColor
                }`}
                title={isShuffled ? 'Modo aleatório ativado' : 'Ativar modo aleatório'}
              >
                <span className="material-symbols-outlined text-[16px]">shuffle</span>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); toggleMusicMode && toggleMusicMode(); }}
                className={`transition-all duration-300 hover:scale-110 active:scale-95 p-0.5 rounded-full ${
                  musicMode === 'youtube' ? 'text-red-400' : 'text-blue-400'
                }`}
                title={musicMode === 'youtube' ? 'Modo YouTube - Clique para Local' : 'Modo Local - Clique para YouTube'}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {musicMode === 'youtube' ? 'smart_display' : 'sd_card'}
                </span>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onOpenMusicPlayer && onOpenMusicPlayer(); }}
                className={`${getTextColor} transition-all duration-300 hover:scale-110 active:scale-95 p-0.5 rounded-full`}
                title="Abrir player completo"
              >
                <span className="material-symbols-outlined text-[16px]">equalizer</span>
              </button>
              <div className="relative" ref={volumeRef}>
                <button
                  onClick={(e) => { e.stopPropagation(); setShowVolumeSlider(!showVolumeSlider); }}
                  className={`${getTextColor} transition-all duration-300 hover:scale-110 active:scale-95 p-0.5 rounded-full`}
                  title="Volume"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {volume === 0 ? 'volume_off' : volume < 50 ? 'volume_down' : 'volume_up'}
                  </span>
                </button>
                {showVolumeSlider && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-gray-900/90 backdrop-blur-xl border border-white/20 rounded-xl p-2 z-20 shadow-xl">
                    <div className="flex items-center gap-2">
                      <span className={`material-symbols-outlined text-[14px] ${getTextColor}`}>
                        {volume === 0 ? 'volume_off' : 'volume_down'}
                      </span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={volume}
                        onChange={(e) => { e.stopPropagation(); onVolumeChange(parseInt(e.target.value)); }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-20 h-1 appearance-none bg-white/30 rounded-full cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md"
                      />
                      <span className={`material-symbols-outlined text-[14px] ${getTextColor}`}>
                        volume_up
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <p className={`font-label-md ${getTextColor} text-[12px] ml-8 opacity-80`}>
            {getFullDate()}
          </p>
          <div className="flex items-center gap-2 ml-8 mt-0.5 min-h-[16px]">
            {weather && (
              <p className={`font-label-md ${getTextColor} text-[11px] opacity-75`}>
                {weather.temp}°C
              </p>
            )}
            {weather && isPlaying && currentTrack && (
              <span className={`${getTextColor} text-[10px] opacity-40 select-none`}>•</span>
            )}
            {isPlaying && currentTrack && (
              <div className="max-w-[75px] sm:max-w-[110px] md:max-w-[160px] overflow-hidden flex items-center">
                <div className="animate-marquee whitespace-nowrap">
                  <p className={`${getTextColor} text-[10px] md:text-[11px] font-medium opacity-85`}>
                    🎵 {currentArtist ? `${currentArtist} - ` : ''}{currentTrack}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Botões Desktop */}
        <div className="hidden md:flex gap-4">
          {(user?.userType === 'raissa' || user?.userType === 'admin') && (
            <button
              onClick={() => user?.userType === 'raissa' ? setShowRaissaMessage(true) : null}
              className="flex flex-col items-center gap-1 hover:bg-white/30 active:bg-white/40 transition-all duration-300 hover:scale-110 active:scale-95 rounded-lg px-3 py-2"
              title={user?.userType === 'raissa' ? 'Perfil da Raíssa' : 'Wallace'}
            >
              <img
                src={user?.userType === 'raissa' ? raissaAvatar : wallaceAvatar}
                alt={user?.userType === 'raissa' ? 'Raíssa' : 'Wallace'}
                className="w-10 h-10 object-cover -mt-4 rounded-full"
              />
              <span className="text-white text-xs font-medium">{user?.userType === 'raissa' ? 'Raíssa' : 'Wallace'}</span>
            </button>
          )}
          <button
            onClick={onOpenCalendar}
            className="flex flex-col items-center gap-1 hover:bg-white/30 active:bg-white/40 transition-all duration-300 hover:scale-110 active:scale-95 rounded-lg px-3 py-2"
            title="Ver mensagens anteriores"
          >
            <span className="material-symbols-outlined text-white transition-transform duration-300">calendar_month</span>
            <span className="text-white text-xs font-medium">Histórico</span>
          </button>
          <button
            onClick={onOpenWeather}
            className="flex flex-col items-center gap-1 hover:bg-white/30 active:bg-white/40 transition-all duration-300 hover:scale-110 active:scale-95 rounded-lg px-3 py-2"
            title="Clima de hoje"
          >
            <span className="material-symbols-outlined text-white transition-transform duration-300">cloud</span>
            <span className="text-white text-xs font-medium">Clima</span>
          </button>
          <button
            onClick={() => setIsTravelMapOpen(true)}
            className="flex flex-col items-center gap-1 hover:bg-white/30 active:bg-white/40 transition-all duration-300 hover:scale-110 active:scale-95 rounded-lg px-3 py-2"
            title="Mapa de Viagens"
          >
            <span className="material-symbols-outlined text-white transition-transform duration-300">map</span>
            <span className="text-white text-xs font-medium">Mapa</span>
          </button>
          <button
            onClick={() => {
              if (user) {
                setIsNotificationModalOpen(true);
                setLastViewedTimestamp(Date.now());
              } else {
                setIsRaissaLoginModalOpen(true);
              }
            }}
            className="flex flex-col items-center gap-1 hover:bg-white/30 active:bg-white/40 transition-all duration-300 hover:scale-110 active:scale-95 rounded-lg px-3 py-2 relative"
            title="Notificações"
          >
            <span className="material-symbols-outlined text-white transition-transform duration-300">notifications</span>
            <span className="text-white text-xs font-medium">Notificações</span>
            {getUnreadCount() > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {getUnreadCount()}
              </span>
            )}
          </button>
          {user?.userType === 'admin' && (
            <button
              onClick={onOpenAdmin}
              className="flex flex-col items-center gap-1 hover:bg-white/30 active:bg-white/40 transition-all duration-300 hover:scale-110 active:scale-95 rounded-lg px-3 py-2"
              title="Área administrativa"
            >
              <span className="material-symbols-outlined text-white transition-transform duration-300">admin_panel_settings</span>
              <span className="text-white text-xs font-medium">Admin</span>
            </button>
          )}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="flex flex-col items-center gap-1 hover:bg-white/30 active:bg-white/40 transition-all duration-300 hover:scale-110 active:scale-95 rounded-lg px-3 py-2"
            title="Menu de Funcionalidades"
          >
            <span className="material-symbols-outlined text-white transition-transform duration-300">settings</span>
            <span className="text-white text-xs font-medium">Menu</span>
          </button>
        </div>

        {/* Botões Mobile */}
        <div className="md:hidden flex gap-2">
          <button
            onClick={() => {
              if (user) {
                setIsNotificationModalOpen(true);
                setLastViewedTimestamp(Date.now());
              } else {
                setIsRaissaLoginModalOpen(true);
              }
            }}
            className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-white/30 active:bg-white/40 transition-all duration-300 hover:scale-110 active:scale-95 relative"
            title="Notificações"
          >
            <span className="material-symbols-outlined text-white transition-transform duration-300 text-[24px]">notifications</span>
            {getUnreadCount() > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {getUnreadCount()}
              </span>
            )}
          </button>
          {(user?.userType === 'raissa' || user?.userType === 'admin') && (
            <button
              onClick={() => user?.userType === 'raissa' ? setShowRaissaMessage(true) : null}
              className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-white/30 active:bg-white/40 transition-all duration-300 hover:scale-110 active:scale-95"
              title={user?.userType === 'raissa' ? 'Perfil da Raíssa' : 'Wallace'}
            >
              <img
                src={user?.userType === 'raissa' ? raissaAvatar : wallaceAvatar}
                alt={user?.userType === 'raissa' ? 'Raíssa' : 'Wallace'}
                className="w-10 h-10 object-cover rounded-full"
              />
            </button>
          )}
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-white/30 active:bg-white/40 transition-all duration-300 hover:scale-110 active:scale-95"
          >
            <span className="material-symbols-outlined text-white transition-transform duration-300 text-[24px]">menu</span>
          </button>
        </div>
      </header>

      <SideMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onOpenCalendar={onOpenCalendar}
        onOpenWeather={onOpenWeather}
        onOpenAdmin={onOpenAdmin}
        onOpenSettings={onOpenSettings}
        onOpenICloudCalendar={onOpenICloudCalendar}
        onOpenTravelMap={onOpenTravelMap}
      />
      
      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
      />

      <TravelMapModal
        isOpen={isTravelMapOpen}
        onClose={() => setIsTravelMapOpen(false)}
      />

      {/* Raíssa Message Modal */}
      {showRaissaMessage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowRaissaMessage(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-300">
            <button
              onClick={() => setShowRaissaMessage(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <span className="material-symbols-outlined text-gray-600 text-[20px]">close</span>
            </button>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full overflow-hidden">
                <img
                  src={raissaAvatar}
                  alt="Raíssa"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-gray-600 leading-relaxed text-lg">
                Amor, você está logada na sua conta, agora pode usar a caixinha de mandar mensagens 💕
              </p>
              <button
                onClick={() => setShowRaissaMessage(false)}
                className="mt-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition duration-200"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
