import { useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { logger } from '../utils/logger';

const CalendarModal = ({ isOpen, onClose, onDateSelect }) => {
  const { user } = useAuth();
  const { getCardBackground, getBorderColor, getTextColor } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const isAdmin = user && user.isAdmin;

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const formatDateKey = (day, month, year) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const handleDateClick = async (day) => {
    const dateKey = formatDateKey(day, currentDate.getMonth(), currentDate.getFullYear());
    setSelectedDate(dateKey);
    
    logger.log('📅 Clicou no dia:', day, 'Data key:', dateKey);
    
    try {
      // Buscar mensagem
      const messageDoc = doc(db, 'mensagens', dateKey);
      const messageSnapshot = await getDoc(messageDoc);
      const message = messageSnapshot.exists() ? messageSnapshot.data().mensagem : null;
      
      // Buscar versículo
      const verseDoc = doc(db, 'verses', dateKey);
      const verseSnapshot = await getDoc(verseDoc);
      const verse = verseSnapshot.exists() ? verseSnapshot.data() : null;
      
      logger.log('✅ Mensagem:', message);
      logger.log('✅ Versículo:', verse);
      
      onDateSelect(dateKey, message, verse);
      onClose();
    } catch (error) {
      logger.error('❌ Erro ao buscar dados:', error);
      onDateSelect(dateKey, null, null);
      onClose();
    }
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days = [];

    // Espaços vazios antes do primeiro dia
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>);
    }

    // Dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = formatDateKey(day, month, year);
      const isToday = today.toDateString() === new Date(year, month, day).toDateString();
      const isFuture = new Date(year, month, day) > today;
      const isDisabled = !isAdmin && isFuture;
      
      days.push(
        <button
          key={day}
          onClick={() => !isDisabled && handleDateClick(day)}
          disabled={isDisabled}
          className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ${
            isDisabled
              ? 'bg-white/10 text-white/30 cursor-not-allowed'
              : isToday 
                ? 'bg-pink-500 text-white hover:scale-110' 
                : 'bg-white/10 hover:bg-white/20 text-white/80 hover:scale-110'
          }`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="calendar-modal-title">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true"></div>
      <div className={`relative ${getCardBackground()} backdrop-blur-[24px] -webkit-backdrop-blur-[24px] border-2 ${getBorderColor()} rounded-3xl p-6 max-w-md w-full shadow-2xl shadow-black/10`}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-all hover:scale-110"
          aria-label="Fechar modal"
        >
          <span className="material-symbols-outlined text-white text-[20px]">close</span>
        </button>

        <h2 id="calendar-modal-title" className={`font-headline-lg text-[28px] ${getTextColor()} mb-4 text-center`}>Histórico de Mensagens</h2>

        <p className={`font-body-md text-[13px] text-white/70 text-center mb-4`}>
          Clique nos dias anteriores para ver o histórico de mensagens
        </p>

        {/* Navegação do mês */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={previousMonth}
            className="p-2 rounded-full hover:bg-white/20 transition-colors"
            aria-label="Mês anterior"
          >
            <span className="material-symbols-outlined text-white/80">chevron_left</span>
          </button>
          <h3 className={`font-body-md text-[16px] ${getTextColor()} font-medium`}>
            {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </h3>
          <button
            onClick={nextMonth}
            className="p-2 rounded-full hover:bg-white/20 transition-colors"
            aria-label="Próximo mês"
          >
            <span className="material-symbols-outlined text-white/80">chevron_right</span>
          </button>
        </div>

        {/* Dias da semana */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, index) => (
            <div key={index} className="text-center text-xs font-medium text-white/60 uppercase">
              {day}
            </div>
          ))}
        </div>

        {/* Calendário */}
        <div className="grid grid-cols-7 gap-1">
          {renderCalendar()}
        </div>
      </div>
    </div>
  );
};

export default CalendarModal;
