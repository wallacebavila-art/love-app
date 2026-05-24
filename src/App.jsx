import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import StatusBarSpacer from './components/StatusBarSpacer';
import Header from './components/Header';
import JourneyCard from './components/JourneyCard';
import DailyMessageCard from './components/DailyMessageCard';
import DailyVerseCard from './components/DailyVerseCard';
import CalendarModal from './components/CalendarModal';
import WeatherModal from './components/WeatherModal';
import Login from './components/Login';
import AdminModal from './components/AdminModal';
import SettingsModal from './components/SettingsModal';
import ProtectedRoute from './components/ProtectedRoute';
import { TimePeriodProvider, useTimePeriod } from './contexts/TimePeriodContext';
import { AuthProvider } from './contexts/AuthContext';
import { fetchDailyMessage } from './services/messageService';
import { fetchDailyVerse } from './services/verseService';
import { fetchWeather } from './services/weatherService';
import { requestNotificationPermission, scheduleDailyNotification, sendDailyMessageNotification, cancelDailyNotification } from './services/notificationService';
import { requestFCMToken, onForegroundMessage, showNotification } from './services/fcmService';
import { saveFCMToken } from './services/fcmTokenService';

function AppContent() {
  const [dailyMessage, setDailyMessage] = useState(null);
  const [dailyVerse, setDailyVerse] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isWeatherModalOpen, setIsWeatherModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [weather, setWeather] = useState(null);
  const location = useLocation();
  const { period } = useTimePeriod();

  useEffect(() => {
    const loadWeather = async () => {
      const weatherData = await fetchWeather();
      setWeather(weatherData);
    };
    loadWeather();
  }, []);

  // Abrir modal de admin quando rota for /admin
  useEffect(() => {
    if (location.pathname === '/admin') {
      setIsAdminModalOpen(true);
    }
  }, [location.pathname]);

  useEffect(() => {
    // Solicita permissão para notificações web
    requestNotificationPermission();

    // Solicita token FCM e salva no Firestore
    requestFCMToken().then(token => {
      if (token) {
        console.log('Token FCM obtido com sucesso:', token);
        // Salva o token no Firestore para envio de notificações
        saveFCMToken(token);
      }
    });

    // Configura listener para mensagens em foreground
    const unsubscribe = onForegroundMessage((payload) => {
      showNotification(payload);
    });

    // Agenda notificação diária (web)
    scheduleDailyNotification(async () => {
      const message = await fetchDailyMessage();
      sendDailyMessageNotification(message);
    });

    return () => {
      unsubscribe();
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

  useEffect(() => {
    const loadVerse = async () => {
      try {
        const verse = await fetchDailyVerse();
        setDailyVerse(verse);
      } catch (error) {
        console.error('Erro ao carregar versículo:', error);
      }
    };

    loadVerse();
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
          onOpenAdmin={() => setIsAdminModalOpen(true)}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
        />
        
        <JourneyCard />
        
        <main className="flex-grow flex items-center justify-center px-6 md:px-16 pb-20">
          <div className="flex flex-col md:flex-row gap-6 w-full max-w-4xl">
            <div className="flex-1">
              <DailyMessageCard 
                message={dailyMessage} 
                selectedDate={selectedDate}
              />
            </div>
            <div className="flex-1">
              <DailyVerseCard 
                verse={dailyVerse}
              />
            </div>
          </div>
        </main>

        
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

        <AdminModal
          isOpen={isAdminModalOpen}
          onClose={() => {
            setIsAdminModalOpen(false);
            // Redirecionar para home se estiver na rota /admin
            if (location.pathname === '/admin') {
              window.history.pushState({}, '', '/');
            }
          }}
        />

        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
        />
      </div>

      {/* Layout Decorative Element */}
      <div className="fixed bottom-1/4 -right-24 w-64 h-64 bg-[#e6b89c]/20 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="fixed top-1/4 -left-24 w-64 h-64 bg-[#9ec2fe]/20 blur-[100px] rounded-full pointer-events-none"></div>

      {/* Marca d'água */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20">
        <p className="font-body-md text-[13px] text-white/60 italic">
          ~para Raíssa. Com amor, Wallace. 💕
        </p>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <TimePeriodProvider>
                  <AppContent />
                </TimePeriodProvider>
              </ProtectedRoute>
            }
          />
          <Route
            path="*"
            element={
              <TimePeriodProvider>
                <AppContent />
              </TimePeriodProvider>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
