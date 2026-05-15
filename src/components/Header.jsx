import { getGreeting } from '../utils/dateUtils';
import { useTimePeriod } from '../contexts/TimePeriodContext';
import { populateSampleMessages } from '../services/populateMessages';
import { fetchWeather } from '../services/weatherService';
import { useState, useEffect } from 'react';
import SideMenu from './SideMenu';

const Header = ({ onOpenCalendar, onOpenWeather }) => {
  const { period } = useTimePeriod();
  const greeting = getGreeting();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [weather, setWeather] = useState(null);

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
      <header className="w-full pt-4 flex justify-between items-center px-6 md:px-16">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className={`material-symbols-outlined ${getIconColor} icon-glow transition-transform duration-300 hover:scale-110 cursor-pointer`} style={{ fontVariationSettings: 'FILL 1' }}>
              {getIcon()}
            </span>
            <h1 className={`font-headline-lg-mobile ${getTextColor} italic transition-all duration-300 hover:scale-105 cursor-default text-[20px]`}>
              {greeting}, Raíssa
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
        <div className="hidden md:flex gap-2">
          <button 
            onClick={populateSampleMessages}
            className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-white/30 active:bg-white/40 transition-all duration-300 hover:scale-110 active:scale-95"
            title="Popular mensagens de exemplo"
          >
            <span className="material-symbols-outlined text-white transition-transform duration-300 text-[18px]">database</span>
          </button>
          <button 
            onClick={onOpenCalendar}
            className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-white/30 active:bg-white/40 transition-all duration-300 hover:scale-110 active:scale-95"
            title="Ver mensagens anteriores"
          >
            <span className="material-symbols-outlined text-white transition-transform duration-300">calendar_month</span>
          </button>
          <button 
            onClick={onOpenWeather}
            className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-white/30 active:bg-white/40 transition-all duration-300 hover:scale-110 active:scale-95"
            title="Clima de hoje"
          >
            <span className="material-symbols-outlined text-white transition-transform duration-300">cloud</span>
          </button>
          <button className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-white/30 active:bg-white/40 transition-all duration-300 hover:scale-110 active:scale-95">
            <span className="material-symbols-outlined text-white transition-transform duration-300">settings</span>
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
      />
    </>
  );
};

export default Header;
