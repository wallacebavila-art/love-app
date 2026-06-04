import { useTheme } from '../contexts/ThemeContext';
import { useState, useEffect } from 'react';

/**
 * Componente genérico de card com revelação (blur)
 * @param {Object} props
 * @param {string} props.title - Título do card (ex: "Mensagem do dia", "Versículo do dia")
 * @param {string|Object} props.content - Conteúdo a ser exibido (string ou objeto com text/reference)
 * @param {boolean} props.loading - Se está carregando
 * @param {Function} props.renderContent - Função customizada para renderizar o conteúdo
 * @param {string} props.height - Altura do card (padrão: "h-[160px] md:h-[240px]")
 */
const RevealCard = ({ title, content, loading = false, renderContent, height = "h-[160px] md:h-[240px]" }) => {
  const { getCardBackground, getBorderColor, getTextColor } = useTheme();
  const [isRevealed, setIsRevealed] = useState(false);

  // Resetar o blur quando o conteúdo mudar
  useEffect(() => {
    setIsRevealed(false);
  }, [content]);

  // Se está carregando, mostra skeleton
  if (loading) {
    return (
      <section className="w-full flex justify-center">
        <div className="w-full flex flex-col items-center">
          <div className={`${getCardBackground()} backdrop-blur-[24px] -webkit-backdrop-blur-[24px] border ${getBorderColor()} w-full ${height} p-4 md:p-5 rounded-[32px] shadow-2xl shadow-black/10 flex flex-col items-center justify-center text-center relative overflow-hidden cursor-pointer`}>
            <span className={`font-label-md text-[11px] uppercase tracking-[0.2em] ${getTextColor}/60 mb-3 flex-shrink-0`}>{title}</span>
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

  // Se não há conteúdo, mostra card vazio
  if (!content) {
    return (
      <section className="w-full flex justify-center">
        <div className="w-full flex flex-col items-center">
          <div className={`${getCardBackground()} backdrop-blur-[24px] -webkit-backdrop-blur-[24px] border ${getBorderColor()} w-full ${height} p-4 md:p-5 rounded-[32px] shadow-2xl shadow-black/10 flex flex-col items-center justify-center text-center relative overflow-hidden cursor-pointer`} onClick={() => setIsRevealed(true)}>
            <span className={`font-label-md text-[11px] uppercase tracking-[0.2em] ${getTextColor}/60 mb-3 flex-shrink-0`}>{title}</span>
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
        <div
          className={`${getCardBackground()} backdrop-blur-[24px] -webkit-backdrop-blur-[24px] border ${getBorderColor()} w-full ${height} p-4 md:p-5 rounded-[32px] shadow-2xl shadow-black/10 flex flex-col items-center text-center relative overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/20 cursor-pointer`}
          onClick={() => setIsRevealed(true)}
        >
          <div className="flex items-center gap-3 mb-2 flex-shrink-0 w-full max-w-[80%]">
            <div className="flex-1 h-[1px] bg-white/30"></div>
            <span className={`font-label-md text-[11px] uppercase tracking-[0.2em] ${getTextColor}/60 flex-shrink-0`}>{title}</span>
            <div className="flex-1 h-[1px] bg-white/30"></div>
          </div>
          <div className={`flex-1 w-full overflow-y-auto custom-scrollbar flex items-start justify-center transition-all duration-700 ease-out pt-2 ${!isRevealed ? 'blur-md scale-95 opacity-60' : 'blur-0 scale-100 opacity-100'}`}>
            {renderContent ? renderContent(content) : (
              <p className={`font-quote-italic font-thin text-[13px] ${getTextColor} italic leading-relaxed`}>
                "{typeof content === 'string' ? content : content.text}"
              </p>
            )}
          </div>
          {typeof content === 'object' && content.reference && (
            <span className={`text-[10px] ${getTextColor}/70 font-normal uppercase tracking-tighter mt-1 flex-shrink-0`}>
              {content.reference}
            </span>
          )}
        </div>
      </div>
    </section>
  );
};

export default RevealCard;
