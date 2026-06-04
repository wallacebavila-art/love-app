import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const WeatherModal = ({ isOpen, onClose, weather }) => {
  const [useLoveName, setUseLoveName] = useState(false);
  const { getCardBackground, getBorderColor, getTextColor } = useTheme();

  useEffect(() => {
    // Carregar preferência do localStorage
    const saved = localStorage.getItem('useLoveName');
    if (saved) {
      try {
        setUseLoveName(JSON.parse(saved));
      } catch (error) {
        console.error('Erro ao fazer parse de useLoveName:', error);
      }
    }

    // Ouvir evento de toggle
    const handleToggle = (e) => {
      setUseLoveName(e.detail);
    };

    window.addEventListener('loveNameToggled', handleToggle);
    return () => window.removeEventListener('loveNameToggled', handleToggle);
  }, []);

  if (!isOpen || !weather) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="weather-modal-title">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true"></div>
      <div className={`relative ${getCardBackground()} backdrop-blur-[24px] -webkit-backdrop-blur-[24px] border-2 ${getBorderColor()} rounded-3xl p-6 max-w-md w-full shadow-2xl shadow-black/10`}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-all hover:scale-110"
          aria-label="Fechar modal"
        >
          <span className="material-symbols-outlined text-white text-[20px]">close</span>
        </button>

        <div className="text-center mb-6">
          <span className="material-symbols-outlined text-blue-400 text-[48px]">cloud</span>
          <h2 id="weather-modal-title" className={`font-headline-lg text-[28px] ${getTextColor()} mt-2`}>Clima de Hoje</h2>
          <p className={`font-body-md text-[14px] text-white/70 mt-2`}>
            {useLoveName ? 'Amor' : 'Raíssa'}, informações do clima para você saber como será seu dia
          </p>
        </div>

        <div className="space-y-4">
          <div className={`flex items-center justify-between p-4 bg-white/10 rounded-xl border ${getBorderColor()}`}>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-blue-400 text-[24px]">thermostat</span>
              <span className={`font-body-md text-[16px] ${getTextColor()}`}>Temperatura</span>
            </div>
            <span className={`font-body-md text-[20px] ${getTextColor()} font-bold`}>{weather.temp}°C</span>
          </div>

          <div className={`flex items-center justify-between p-4 bg-white/10 rounded-xl border ${getBorderColor()}`}>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-blue-400 text-[24px]">device_thermostat</span>
              <span className={`font-body-md text-[16px] ${getTextColor()}`}>Sensação Térmica</span>
            </div>
            <span className={`font-body-md text-[20px] ${getTextColor()} font-bold`}>{weather.feelsLike}°C</span>
          </div>

          <div className={`flex items-center justify-between p-4 bg-white/10 rounded-xl border ${getBorderColor()}`}>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-blue-400 text-[24px]">water_drop</span>
              <span className={`font-body-md text-[16px] ${getTextColor()}`}>Umidade</span>
            </div>
            <span className={`font-body-md text-[20px] ${getTextColor()} font-bold`}>{weather.humidity}%</span>
          </div>

          <div className={`flex items-center justify-between p-4 bg-white/10 rounded-xl border ${getBorderColor()}`}>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-blue-400 text-[24px]">wb_sunny</span>
              <span className={`font-body-md text-[16px] ${getTextColor()}`}>Condição</span>
            </div>
            <span className={`font-body-md text-[16px] ${getTextColor()} font-medium capitalize`}>{weather.description}</span>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="font-body-md text-[12px] text-white/60">
            Rio de Janeiro, Brasil
          </p>
        </div>
      </div>
    </div>
  );
};

export default WeatherModal;
