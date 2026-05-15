import { useEffect, useState } from 'react';
import StatusBarSpacer from './components/StatusBarSpacer';
import Header from './components/Header';
import JourneyCard from './components/JourneyCard';
import DailyMessageCard from './components/DailyMessageCard';
import TimeSimulator from './components/TimeSimulator';
import CalendarModal from './components/CalendarModal';
import WeatherModal from './components/WeatherModal';
import { TimePeriodProvider, useTimePeriod } from './contexts/TimePeriodContext';
import { fetchDailyMessage } from './services/messageService';
import { fetchWeather } from './services/weatherService';
import { requestNotificationPermission, scheduleDailyNotification, sendDailyMessageNotification, cancelDailyNotification } from './services/notificationService';

function AppContent() {
  const [dailyMessage, setDailyMessage] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isWeatherModalOpen, setIsWeatherModalOpen] = useState(false);
  const [weather, setWeather] = useState(null);
  const { period, isSimulating, handleTimeChange, handleToggleSimulation } = useTimePeriod();

  useEffect(() => {
    const loadWeather = async () => {
      const weatherData = await fetchWeather();
      setWeather(weatherData);
    };
    loadWeather();
  }, []);

  useEffect(() => {
    // Solicita permissão para notificações
    requestNotificationPermission();

    // Agenda notificação diária
    scheduleDailyNotification(async () => {
      const message = await fetchDailyMessage();
      sendDailyMessageNotification(message);
    });

    return () => {
      cancelDailyNotification();
    };
  }, []);

  useEffect(() => {
    const loadMessage = async () => {
      try {
        const message = await fetchDailyMessage();
        setDailyMessage(message);
      } catch (error) {
        console.error('Erro ao carregar mensagem:', error);
      }
    };

    loadMessage();
  }, []);

  const getThemeClasses = () => {
    switch (period) {
      case 'morning':
        return 'morning-theme text-white';
      case 'afternoon':
        return 'afternoon-theme text-white';
      case 'night':
        return 'night-theme text-white';
      default:
        return 'morning-theme text-white';
    }
  };

  const getSelectionClasses = () => {
    switch (period) {
      case 'morning':
        return 'selection:bg-white/30 selection:text-white';
      case 'afternoon':
        return 'selection:bg-white/30 selection:text-white';
      case 'night':
        return 'selection:bg-white/30 selection:text-white';
      default:
        return 'selection:bg-white/30 selection:text-white';
    }
  };

  const handleDateSelect = (dateKey, message) => {
    console.log('📅 Data selecionada:', dateKey, 'Mensagem:', message);
    setSelectedDate(dateKey);
    if (message) {
      setDailyMessage(message);
    } else {
      console.log('⚠️ Nenhuma mensagem para esta data');
    }
  };

  return (
    <div className={`${getThemeClasses()} ${getSelectionClasses()} font-body-md min-h-screen overflow-x-hidden`}>
      {/* Hero Background Layer */}
      <div className="fixed inset-0 z-0">
        {/* Background image is applied via CSS theme classes */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#fbf9f5]/20"></div>
      </div>

      {/* Main Layout Container */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <StatusBarSpacer />
        
        <Header 
          onOpenCalendar={() => setIsCalendarOpen(true)}
          onOpenWeather={() => setIsWeatherModalOpen(true)}
        />
        
        <JourneyCard />
        
        <main className="flex-grow flex items-center justify-center px-6 md:px-16 pb-20">
          <DailyMessageCard 
            message={dailyMessage} 
            selectedDate={selectedDate}
          />
        </main>

        <TimeSimulator 
          onTimeChange={handleTimeChange}
          isSimulating={isSimulating}
          onToggleSimulation={handleToggleSimulation}
        />
        
        <CalendarModal
          isOpen={isCalendarOpen}
          onClose={() => setIsCalendarOpen(false)}
          onDateSelect={handleDateSelect}
        />

        <WeatherModal
          isOpen={isWeatherModalOpen}
          onClose={() => setIsWeatherModalOpen(false)}
          weather={weather}
        />
      </div>

      {/* Layout Decorative Element */}
      <div className="fixed bottom-1/4 -right-24 w-64 h-64 bg-[#e6b89c]/20 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="fixed top-1/4 -left-24 w-64 h-64 bg-[#9ec2fe]/20 blur-[100px] rounded-full pointer-events-none"></div>
    </div>
  );
}

function App() {
  return (
    <TimePeriodProvider>
      <AppContent />
    </TimePeriodProvider>
  );
}

export default App;
