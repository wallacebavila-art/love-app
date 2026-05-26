import { getGreeting } from '../utils/dateUtils';
import { useTimePeriod } from '../contexts/TimePeriodContext';
import { fetchWeather } from '../services/weatherService';
import { useState, useEffect } from 'react';
import SideMenu from './SideMenu';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from './NotificationToast';

const Header = ({ onOpenCalendar, onOpenWeather, onOpenAdmin, onOpenSettings, onOpenICloudCalendar }) => {
  const { period } = useTimePeriod();
  const { user } = useAuth();
  const navigate = useNavigate();
  const greeting = getGreeting();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [weather, setWeather] = useState(null);
  const [useLoveName, setUseLoveName] = useState(false);
  const { notifications, setNotifications } = useNotifications();

  useEffect(() => {
    console.log('Header - Notificações:', notifications);
  }, [notifications]);

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
            className="flex flex-col items-center gap-1 hover:bg-white/30 active:bg-white/40 transition-all duration-300 hover:scale-110 active:scale-95 rounded-lg px-3 py-2 relative"
            title="Notificações"
          >
            <span className="material-symbols-outlined text-white transition-transform duration-300">notifications</span>
            <span className="text-white text-xs font-medium">Notificações</span>
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {notifications.length}
              </span>
            )}
          </button>
          {user && (
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

        {/* Botão Hamburger Mobile */}
        <button 
          onClick={() => setIsMenuOpen(true)}
          className="md:hidden w-12 h-12 flex items-center justify-center rounded-full hover:bg-white/30 active:bg-white/40 transition-all duration-300 hover:scale-110 active:scale-95"
        >
          <span className="material-symbols-outlined text-white transition-transform duration-300 text-[24px]">menu</span>
        </button>
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
    </>
  );
};

export default Header;
