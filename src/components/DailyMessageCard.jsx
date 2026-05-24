import { useTimePeriod } from '../contexts/TimePeriodContext';
import { useState, useEffect } from 'react';

const DailyMessageCard = ({ message }) => {
  const { period } = useTimePeriod();
  const [isRevealed, setIsRevealed] = useState(false);

  // Resetar o blur quando a mensagem mudar
  useEffect(() => {
    setIsRevealed(false);
  }, [message]);

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

  const getAccentColor = () => {
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
    <section className="w-full flex justify-center">
      <div className="w-full max-w-2xl flex flex-col items-center space-y-6">
        {/* Central Message Card (Glassmorphism) */}
        <div 
          className={`${getCardBackground()} backdrop-blur-[24px] -webkit-backdrop-blur-[24px] border ${getBorderColor()} w-full min-h-[200px] p-8 md:p-12 rounded-[40px] shadow-2xl shadow-black/10 flex flex-col items-center justify-center text-center relative overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/20 cursor-pointer`}
          onClick={() => setIsRevealed(true)}
        >
          <span className={`font-label-md text-[12px] uppercase tracking-[0.2em] ${getTextColor}/60 mb-4`}>Mensagem do dia</span>
          <p className={`font-quote-italic font-thin text-[14px] ${getTextColor} italic leading-relaxed transition-all duration-700 ease-out ${!isRevealed ? 'blur-md scale-95 opacity-60' : 'blur-0 scale-100 opacity-100'}`}>
            "{message}"
          </p>
        </div>
      </div>
    </section>
  );
};

export default DailyMessageCard;
