import { useThemeStyles } from '../hooks/useThemeStyles';
import { useState, useEffect } from 'react';

const DailyMessageCard = ({ message }) => {
  const { getCardBackground, getBorderColor, getTextColor } = useThemeStyles();
  const [isRevealed, setIsRevealed] = useState(false);

  // Resetar o blur quando a mensagem mudar
  useEffect(() => {
    setIsRevealed(false);
  }, [message]);

  return (
    <section className="w-full flex justify-center">
      <div className="w-full flex flex-col items-center">
        {/* Central Message Card (Glassmorphism) - Altura fixa com scroll interno */}
        <div
          className={`${getCardBackground()} backdrop-blur-[24px] -webkit-backdrop-blur-[24px] border ${getBorderColor()} w-full h-[160px] md:h-[240px] p-4 md:p-5 rounded-[32px] shadow-2xl shadow-black/10 flex flex-col items-center justify-center text-center relative overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/20 cursor-pointer`}
          onClick={() => setIsRevealed(true)}
        >
          <div className="flex items-center gap-3 mb-3 flex-shrink-0 w-full max-w-[80%]">
            <div className="flex-1 h-[1px] bg-white/30"></div>
            <span className={`font-label-md text-[11px] uppercase tracking-[0.2em] ${getTextColor}/60 flex-shrink-0`}>Mensagem do dia</span>
            <div className="flex-1 h-[1px] bg-white/30"></div>
          </div>
          <div className={`flex-1 w-full overflow-y-auto custom-scrollbar flex items-start justify-center transition-all duration-700 ease-out pt-2 ${!isRevealed ? 'blur-md scale-95 opacity-60' : 'blur-0 scale-100 opacity-100'}`}>
            <p className={`font-quote-italic font-thin text-[13px] ${getTextColor} italic leading-relaxed`}>
              "{message}"
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DailyMessageCard;
