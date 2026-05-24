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
import ICloudCalendarWidget from './components/ICloudCalendarWidget';
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
  const [isICloudCalendarModalOpen, setIsICloudCalendarModalOpen] = useState(false);
  const [weather, setWeather] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
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
        setDailyMessage('Pensando...');
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
        setDailyVerse({ text: 'Pensando...', reference: '' });
      }
    };

    loadVerse();
  }, []);

  useEffect(() => {
    let timer = null;
    
    const checkLoadingComplete = () => {
      if (dailyMessage && dailyVerse) {
        timer = setTimeout(() => {
          setIsLoading(false);
        }, 2000);
      }
    };

    checkLoadingComplete();

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [dailyMessage, dailyVerse]);



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

  const handleDateSelect = (dateKey, message, verse) => {
    console.log('📅 Data selecionada:', dateKey, 'Mensagem:', message, 'Versículo:', verse);
    setSelectedDate(dateKey);
    if (message) {
      setDailyMessage(message);
    } else {
      console.log('⚠️ Nenhuma mensagem para esta data');
      setDailyMessage('Pensando...');
    }
    if (verse) {
      setDailyVerse(verse);
    } else {
      console.log('⚠️ Nenhum versículo para esta data');
      setDailyVerse({ text: 'Pensando...', reference: '' });
    }
  };

  return (
    <>
      <div className={`${getThemeClasses()} ${getSelectionClasses()} font-body-md min-h-screen overflow-x-hidden`}>
        {/* Tela de Carregamento Discreta */}
        {isLoading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md">
            <div className="flex flex-col items-center space-y-3">
              <div className="w-12 h-12 flex items-center justify-center">
                <svg className="w-12 h-12 text-white animate-pulse" fill="currentColor" viewBox="0 0 24 24" style={{ animationDuration: '1.5s' }}>
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </div>
              <p className="text-white text-3xl font-bold tracking-wider">BdR</p>
              <p className="text-white/80 text-sm font-medium">Carregando...</p>
            </div>
          </div>
        )}
        
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
            onOpenICloudCalendar={() => setIsICloudCalendarModalOpen(true)}
          />
          
          <div className="flex-grow px-4 md:px-8 py-2">
            {/* Container alinhado com o calendário */}
            <div className="flex flex-col md:flex-row gap-4">
              {/* Coluna esquerda (Journey Card + Calendário) */}
              <div className="w-full md:w-80 flex-shrink-0 space-y-4 mt-2 md:overflow-y-auto md:custom-scrollbar md:pr-1 md:max-h-[calc(100vh-120px)]">
                <JourneyCard />
                <div className="hidden md:block">
                  <ICloudCalendarWidget />
                </div>
              </div>
              
              {/* Coluna direita (Cards de mensagem e versículo) */}
              <div className="flex-grow flex flex-col items-center md:items-start md:justify-center mt-4 md:mt-0">
                {/* Data */}
                <div className="mb-4">
                  <p className="font-body-md text-white/80 text-lg font-semibold">
                    {selectedDate ? formatDisplayDate(selectedDate) : getTodayDate()}
                  </p>
                </div>
                
                {/* Cards */}
                <div className="flex flex-col md:flex-row gap-4 w-full max-w-3xl">
                  <div className="flex-1">
                    <DailyMessageCard 
                      key={selectedDate || 'today'}
                      message={dailyMessage} 
                    />
                  </div>
                  <div className="flex-1">
                    <DailyVerseCard 
                      key={selectedDate || 'today'}
                      verse={dailyVerse}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          
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

          {isICloudCalendarModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsICloudCalendarModalOpen(false)}></div>
              <div className="relative bg-white/90 backdrop-blur-xl border border-white/30 rounded-2xl p-5 shadow-2xl w-full max-w-md">
                <button
                  onClick={() => setIsICloudCalendarModalOpen(false)}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <span className="material-symbols-outlined text-gray-600">close</span>
                </button>
                <ICloudCalendarWidget isModal={true} />
              </div>
            </div>
          )}
        </div>

        {/* Layout Decorative Element */}
        <div className="fixed bottom-1/4 -right-24 w-64 h-64 bg-[#e6b89c]/20 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="fixed top-1/4 -left-24 w-64 h-64 bg-[#9ec2fe]/20 blur-[100px] rounded-full pointer-events-none"></div>
      </div>
    </>
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
