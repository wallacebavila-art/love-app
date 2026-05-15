import { useTimePeriod } from '../contexts/TimePeriodContext';

const DailyMessageCard = ({ message, selectedDate }) => {
  const { period } = useTimePeriod();

  // Formatar data de hoje para exibição
  const getTodayDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Formatar data selecionada para exibição (YYYY-MM-DD -> DD/MM/YYYY)
  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };
  
  // Mensagem padrão do HTML original como fallback
  const defaultMessage = "Bom dia, meu amor! Que seu dia comece com a mesma doçura do seu sorriso. Lembre-se que você é a luz da minha vida.";
  
  const displayMessage = message || defaultMessage;

  const getCardBackground = () => {
    switch (period) {
      case 'morning':
        return 'bg-white/45';
      case 'afternoon':
        return 'bg-white/45';
      case 'night':
        return 'bg-white/35';
      default:
        return 'bg-white/45';
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
        <div className={`${getCardBackground()} backdrop-blur-[24px] -webkit-backdrop-blur-[24px] border ${getBorderColor()} w-full p-8 md:p-12 rounded-[40px] shadow-2xl shadow-black/10 flex flex-col items-center text-center relative overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/20`}>
          <p className={`font-quote-italic ${getTextColor} italic leading-relaxed transition-opacity duration-300 hover:opacity-90`}>
            "{displayMessage}"
          </p>
          <div className="mt-6 w-12 h-[1px] bg-white/30"></div>
          <div className="mt-4 flex items-center gap-3 text-white/70 font-label-md uppercase tracking-tighter">
            <span>{selectedDate ? formatDisplayDate(selectedDate) : getTodayDate()}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DailyMessageCard;
