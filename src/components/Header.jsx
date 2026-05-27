import { getGreeting } from '../utils/dateUtils';
import { useTimePeriod } from '../contexts/TimePeriodContext';
import { fetchWeather } from '../services/weatherService';
import { useState, useEffect } from 'react';
import SideMenu from './SideMenu';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from './NotificationToast';
import NotificationModal from './NotificationModal';
import { useLoginModal } from '../contexts/LoginModalContext';
import raissaAvatar from '/favicon.png';

const Header = ({ onOpenCalendar, onOpenWeather, onOpenAdmin, onOpenSettings, onOpenICloudCalendar }) => {
  const { period } = useTimePeriod();
  const { user } = useAuth();
  const navigate = useNavigate();
  const greeting = getGreeting();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [weather, setWeather] = useState(null);
  const [useLoveName, setUseLoveName] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [showRaissaMessage, setShowRaissaMessage] = useState(false);
  const { notifications, setNotifications, lastViewedTimestamp, setLastViewedTimestamp } = useNotifications();
  const { setIsRaissaLoginModalOpen } = useLoginModal();

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

  // Calcular notificações não visualizadas
  const getUnreadCount = () => {
    if (!lastViewedTimestamp) return notifications.length;
    return notifications.filter(n => {
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
          </div>
          <p className={`font-label-md ${getTextColor} text-[12px] ml-8 opacity-80`}>
            {getFullDate()}
          </p>
          {weather && (
            <p className={`font-label-md ${getTextColor} text-[11px] ml-8 opacity-70`}>
              {weather.temp}°C
            </p>
          )}
        </div>
        
        {/* Botões Desktop */}
        <div className="hidden md:flex gap-4">
          {user?.userType === 'raissa' && (
            <button
              onClick={() => setShowRaissaMessage(true)}
              className="flex flex-col items-center gap-1 hover:bg-white/30 active:bg-white/40 transition-all duration-300 hover:scale-110 active:scale-95 rounded-lg px-3 py-2"
              title="Perfil da Raíssa"
            >
              <img
                src={raissaAvatar}
                alt="Raíssa"
                className="w-10 h-10 object-cover -mt-4"
              />
              <span className="text-white text-xs font-medium">Raíssa</span>
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
          {user?.userType === 'raissa' && (
            <button
              onClick={() => setShowRaissaMessage(true)}
              className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-white/30 active:bg-white/40 transition-all duration-300 hover:scale-110 active:scale-95"
              title="Perfil da Raíssa"
            >
              <img
                src={raissaAvatar}
                alt="Raíssa"
                className="w-10 h-10 object-cover"
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
      />
      
      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
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
