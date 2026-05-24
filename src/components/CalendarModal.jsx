import { useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { useAuth } from '../contexts/AuthContext';

const CalendarModal = ({ isOpen, onClose, onDateSelect }) => {
  const { user } = useAuth();
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
    
    console.log('📅 Clicou no dia:', day, 'Data key:', dateKey);
    
    try {
      const messageDoc = doc(db, 'mensagens', dateKey);
      const docSnapshot = await getDoc(messageDoc);
      
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        console.log('✅ Mensagem encontrada:', data.mensagem);
        onDateSelect(dateKey, data.mensagem);
      } else {
        console.log('❌ Nenhuma mensagem encontrada para:', dateKey);
        onDateSelect(dateKey, null);
      }
      onClose();
    } catch (error) {
      console.error('❌ Erro ao buscar mensagem:', error);
      onDateSelect(dateKey, null);
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
              ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
              : isToday 
                ? 'bg-pink-500 text-white hover:scale-110' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:scale-110'
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <span className="material-symbols-outlined text-gray-600 text-[20px]">close</span>
        </button>

        <h2 className="font-headline-lg text-[28px] text-gray-800 mb-4 text-center">Calendário</h2>

        {/* Navegação do mês */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={previousMonth}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <span className="material-symbols-outlined text-gray-600">chevron_left</span>
          </button>
          <h3 className="font-body-md text-[16px] text-gray-700 font-medium">
            {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </h3>
          <button
            onClick={nextMonth}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <span className="material-symbols-outlined text-gray-600">chevron_right</span>
          </button>
        </div>

        {/* Dias da semana */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, index) => (
            <div key={index} className="text-center text-xs font-medium text-gray-500 uppercase">
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
