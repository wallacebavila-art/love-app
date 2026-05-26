import { useTimePeriod } from '../contexts/TimePeriodContext';
import { useState, useEffect } from 'react';

const DailyVerseCard = ({ verse }) => {
  const { period } = useTimePeriod();
  const [isRevealed, setIsRevealed] = useState(false);

  // Resetar o blur quando o versículo mudar
  useEffect(() => {
    setIsRevealed(false);
  }, [verse]);

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

  // Se não há versículo, mostra blur com título
  if (!verse) {
    return (
      <section className="w-full flex justify-center">
        <div className="w-full flex flex-col items-center">
          <div className={`${getCardBackground()} backdrop-blur-[24px] -webkit-backdrop-blur-[24px] border ${getBorderColor()} w-full h-[240px] p-4 md:p-5 rounded-[32px] shadow-2xl shadow-black/10 flex flex-col items-center justify-center text-center relative overflow-hidden cursor-pointer`} onClick={() => setIsRevealed(true)}>
            <span className={`font-label-md text-[11px] uppercase tracking-[0.2em] ${getTextColor}/60 mb-3 flex-shrink-0`}>Versículo do dia</span>
            <div className="animate-pulse flex-1 flex items-center justify-center">
              <div className="h-4 bg-white/30 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-white/30 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-white/30 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full flex justify-center">
      <div className="w-full flex flex-col items-center">
        {/* Verse Card (Glassmorphism) - Altura fixa com scroll interno */}
        <div
          className={`${getCardBackground()} backdrop-blur-[24px] -webkit-backdrop-blur-[24px] border ${getBorderColor()} w-full h-[240px] p-4 md:p-5 rounded-[32px] shadow-2xl shadow-black/10 flex flex-col items-center text-center relative overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/20 cursor-pointer`}
          onClick={() => setIsRevealed(true)}
        >
          <div className="flex items-center gap-3 mb-2 flex-shrink-0 w-full max-w-[80%]">
            <div className="flex-1 h-[1px] bg-white/30"></div>
            <span className={`font-label-md text-[11px] uppercase tracking-[0.2em] ${getTextColor}/60 flex-shrink-0`}>Versículo do dia</span>
            <div className="flex-1 h-[1px] bg-white/30"></div>
          </div>
          <div className={`flex-1 w-full overflow-y-auto custom-scrollbar flex items-start justify-center transition-all duration-700 ease-out pt-2 ${!isRevealed ? 'blur-md scale-95 opacity-60' : 'blur-0 scale-100 opacity-100'}`}>
            <p className={`font-quote-italic font-thin text-[13px] ${getTextColor} italic leading-relaxed`}>
              "{verse.text}"
            </p>
          </div>
          {verse.reference && (
            <span className={`text-[10px] ${getTextColor}/70 font-normal uppercase tracking-tighter mt-1 flex-shrink-0`}>
              {verse.reference}
            </span>
          )}
        </div>
      </div>
    </section>
  );
};

export default DailyVerseCard;
