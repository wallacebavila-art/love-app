import { useState, useEffect, useRef } from 'react';
import { useCalendarEvents } from '../contexts/CalendarEventsContext';
import { useTimePeriod } from '../contexts/TimePeriodContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const ICloudCalendarWidget = ({ isModal = false }) => {
  const { period } = useTimePeriod();
  const { events, isLoading, isRefreshing, lastUpdated, refresh } = useCalendarEvents();
  const { user } = useAuth();
  const { getCardBackground, getBorderColor, getTextColor } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const eventsSectionRef = useRef(null);
  const calendarContainerRef = useRef(null);

  // Lista de meses
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const getCardBackgroundClass = () => {
    return getCardBackground();
  };

  // Obter o nome do mês
  const getMonthName = (date) => {
    return months[date.getMonth()];
  };

  // Obter os dias do mês
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = [];
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Dias do mês anterior para preencher o início
    for (let i = 0; i < firstDay; i++) {
      days.push({ date: null, isCurrentMonth: false });
    }

    // Dias do mês atual
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }

    return days;
  };

  // Verificar se uma data tem eventos
  const hasEvents = (date) => {
    if (!date) return false;
    const dateStr = date.toDateString();
    return events.some(event => event.startDate.toDateString() === dateStr);
  };

  // Verificar se uma data é hoje
  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Obter eventos para uma data específica
  const getEventsForDate = (date) => {
    if (!date) return [];
    const dateStr = date.toDateString();
    return events.filter(event => event.startDate.toDateString() === dateStr);
  };

  // Formatar data para exibição
  const formatDate = (date) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('pt-BR', options);
  };

  // Formatar horário
  const formatTime = (date, isAllDay) => {
    if (isAllDay) return 'Todo dia';
    const options = { hour: '2-digit', minute: '2-digit' };
    return date.toLocaleTimeString('pt-BR', options);
  };

  // Gerar lista de anos (10 anos para trás e 10 para frente)
  const getYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 10; i <= currentYear + 10; i++) {
      years.push(i);
    }
    return years;
  };

  // Selecionar ano
  const selectYear = (year) => {
    setCurrentDate(new Date(year, currentDate.getMonth(), 1));
    setShowYearPicker(false);
    setSelectedDate(null);
  };

  // Selecionar mês
  const selectMonth = (monthIndex) => {
    setCurrentDate(new Date(currentDate.getFullYear(), monthIndex, 1));
    setShowMonthPicker(false);
    setSelectedDate(null);
  };

  const days = getDaysInMonth(currentDate);

  const formatLastUpdated = (date) => {
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Scroll automático para a seção de eventos ao selecionar uma data
  useEffect(() => {
    if (selectedDate && eventsSectionRef.current && calendarContainerRef.current) {
      const timeout = setTimeout(() => {
        eventsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [selectedDate]);

  return (
    <>
      {/* Calendário completo */}
      <div
        ref={calendarContainerRef}
        className={`${getCardBackgroundClass()} backdrop-blur-[24px] -webkit-backdrop-blur-[24px] border-2 ${getBorderColor()} rounded-3xl ${isModal ? 'pt-12 p-4' : 'p-4'} shadow-2xl shadow-black/10 w-full overflow-y-auto scrollbar-hidden ${
          isModal ? 'max-h-[90vh]' : 'max-h-[calc(100vh-10rem)]'
        }`}
      >
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const prevMonth = new Date(currentDate);
                prevMonth.setMonth(prevMonth.getMonth() - 1);
                setCurrentDate(prevMonth);
                setSelectedDate(null);
              }}
              className="p-2 rounded-full transition-all hover:bg-white/30 text-white hover:scale-110"
              title="Mês anterior"
            >
              <span className="material-symbols-outlined text-[22px]">chevron_left</span>
            </button>
            
            <div className="flex items-center gap-2">
              {/* Selecionar mês */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowMonthPicker(!showMonthPicker);
                    setShowYearPicker(false);
                  }}
                  className="px-3 py-1.5 rounded-lg transition-all font-bold text-[14px] bg-white/20 hover:bg-white/30 text-white"
                >
                  {getMonthName(currentDate)} ▾
                </button>
                {showMonthPicker && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-black/80 backdrop-blur-xl border border-white/20 rounded-xl p-2 z-10 w-40 shadow-xl">
                    <div className="grid grid-cols-3 gap-1">
                      {months.map((month, index) => (
                        <button
                          key={index}
                          onClick={() => selectMonth(index)}
                          className={`px-2 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                            currentDate.getMonth() === index
                              ? 'bg-pink-500/50 text-white'
                              : 'text-white/80 hover:bg-white/20'
                          }`}
                        >
                          {month.slice(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Selecionar ano */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowYearPicker(!showYearPicker);
                    setShowMonthPicker(false);
                  }}
                  className="px-3 py-1.5 rounded-lg transition-all font-bold text-[14px] bg-white/20 hover:bg-white/30 text-white"
                >
                  {currentDate.getFullYear()} ▾
                </button>
                {showYearPicker && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-black/80 backdrop-blur-xl border border-white/20 rounded-xl p-2 z-10 w-28 max-h-40 overflow-y-auto custom-scrollbar shadow-xl">
                    <div className="flex flex-col gap-1">
                      {getYears().map((year) => (
                        <button
                          key={year}
                          onClick={() => selectYear(year)}
                          className={`px-2 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                            currentDate.getFullYear() === year
                              ? 'bg-pink-500/50 text-white'
                              : 'text-white/80 hover:bg-white/20'
                          }`}
                        >
                          {year}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => {
                const nextMonth = new Date(currentDate);
                nextMonth.setMonth(nextMonth.getMonth() + 1);
                setCurrentDate(nextMonth);
                setSelectedDate(null);
              }}
              className="p-2 rounded-full transition-all hover:bg-white/30 text-white hover:scale-110"
              title="Próximo mês"
            >
              <span className="material-symbols-outlined text-[22px]">chevron_right</span>
            </button>

            <button
              onClick={() => refresh()}
              disabled={isLoading || isRefreshing}
              title="Atualizar calendário"
              className="p-2 rounded-full transition-all disabled:opacity-50 hover:bg-white/30 text-white/80 hover:scale-110"
            >
              <span
                className={`material-symbols-outlined text-[20px] ${isRefreshing ? 'animate-spin' : ''}`}
              >
                refresh
              </span>
            </button>
          </div>
        </div>

        <p
          className={`text-center font-body-md text-[10px] mb-2 -mt-1 ${getTextColor()}/50`}
        >
          {isLoading && !lastUpdated
            ? 'Carregando calendário...'
            : isRefreshing
              ? 'Atualizando...'
              : lastUpdated
                ? `Atualizado em ${formatLastUpdated(lastUpdated)}`
                : null}
        </p>
        
        {/* Fechar pickers ao clicar fora */}
        {(showYearPicker || showMonthPicker) && (
          <div 
            className="fixed inset-0 z-0"
            onClick={() => {
              setShowYearPicker(false);
              setShowMonthPicker(false);
            }}
          ></div>
        )}

        {/* Dias da semana */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, i) => (
            <div
              key={i}
              className={`text-center font-body-md text-[11px] font-semibold ${getTextColor()}/60`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Grid de dias */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => (
            <div
              key={index}
              className={`
                aspect-square flex flex-col items-center justify-center rounded-xl cursor-pointer transition-all duration-200
                ${!day.isCurrentMonth ? 'opacity-30' : ''}
                ${isToday(day.date) 
                  ? 'bg-pink-500/30 border border-pink-400' 
                  : 'hover:bg-white/20'}
                ${selectedDate && day.date && selectedDate.toDateString() === day.date.toDateString() 
                  ? 'bg-white/30' 
                  : ''}
              `}
              onClick={() => {
                if (day.isCurrentMonth) {
                  if (
                    selectedDate &&
                    day.date &&
                    selectedDate.toDateString() === day.date.toDateString()
                  ) {
                    setSelectedDate(null);
                  } else {
                    setSelectedDate(day.date);
                  }
                }
              }}
            >
              {day.date && (
                <>
                  <span className={`font-body-md text-[14px] ${getTextColor()}`}>
                    {day.date.getDate()}
                  </span>
                  {hasEvents(day.date) && (
                    <div className="w-1.5 h-1.5 bg-pink-400 rounded-full mt-1"></div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>

          {selectedDate && (
          <div
            ref={eventsSectionRef}
            className={`mt-4 pt-4 border-t scroll-mt-4 border-white/20`}
          >
            <h4 className={`font-headline-sm text-[16px] font-semibold ${getTextColor()} mb-3`}>
              📅 {formatDate(selectedDate)}
            </h4>

            {isLoading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-white/30 rounded w-3/4 mb-1"></div>
                    <div className="h-3 bg-white/20 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : user ? (
              <div className="space-y-2">
                {getEventsForDate(selectedDate).length === 0 ? (
                  <div className={`text-center py-6 ${getTextColor()}/50`}>
                    <span className="material-symbols-outlined text-[32px] block mb-2">event_busy</span>
                    <p className={`font-body-md text-[13px]`}>
                      Nenhum evento para esta data
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {getEventsForDate(selectedDate).map((event) => (
                      <div
                        key={event.id}
                        className={`bg-white/10 border border-white/20 rounded-xl p-3 transition-all hover:scale-[1.01]`}
                      >
                        <p className={`font-body-md text-[14px] font-semibold ${getTextColor()}`}>
                          {event.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className="material-symbols-outlined text-[14px] opacity-60"
                          >
                            schedule
                          </span>
                          <p
                            className={`font-body-md text-[12px] ${getTextColor()}/70`}
                          >
                            {formatTime(event.startDate, event.isAllDay)}
                          </p>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-2 mt-0.5">
                            <span
                              className="material-symbols-outlined text-[14px] opacity-60"
                            >
                              location_on
                            </span>
                            <p
                              className={`font-body-md text-[11px] ${getTextColor()}/70`}
                            >
                              {event.location}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className={`text-center py-6 ${getTextColor()}/50`}>
                <span className="material-symbols-outlined text-[32px] block mb-2">lock</span>
                <p className={`font-body-md text-[13px]`}>
                  Faça login para ver os eventos
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default ICloudCalendarWidget;
