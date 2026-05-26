import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import StatusBarSpacer from './components/StatusBarSpacer';
import Header from './components/Header';
import JourneyCard from './components/JourneyCard';
import DailyMessageCard from './components/DailyMessageCard';
import DailyVerseCard from './components/DailyVerseCard';
import PhotoGalleryCard from './components/PhotoGalleryCard';
import CalendarModal from './components/CalendarModal';
import WeatherModal from './components/WeatherModal';
import Login from './components/Login';
import AdminModal from './components/AdminModal';
import SettingsModal from './components/SettingsModal';
import ICloudCalendarWidget from './components/ICloudCalendarWidget';
import UpcomingEventsTicker from './components/UpcomingEventsTicker';
import ProtectedRoute from './components/ProtectedRoute';
import { TimePeriodProvider, useTimePeriod } from './contexts/TimePeriodContext';
import { CalendarEventsProvider } from './contexts/CalendarEventsContext';
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
  const [bookOpenStage, setBookOpenStage] = useState('closed'); // 'closed' | 'opening' | 'open'
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
          // Iniciar animação de abertura do livro
          setBookOpenStage('opening');
          // Após a animação de abertura, remover loading
          setTimeout(() => {
            setBookOpenStage('open');
            setIsLoading(false);
          }, 1200);
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
        {/* Tela de Carregamento com efeito de livro abrindo */}
        {(isLoading || bookOpenStage === 'opening') && (
          <>
            {/* Metade esquerda do livro - apenas "BdR" bem colado no centro */}
            <div
              className={`fixed inset-y-0 left-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-end pr-4 md:pr-8 overflow-hidden transition-all duration-1000 ease-in-out ${
                bookOpenStage === 'opening'
                  ? 'w-0 opacity-0 [transform:perspective(1200px)_rotateY(15deg)_translateX(-30px)] backdrop-blur-xl'
                  : 'w-1/2 opacity-100 [transform:perspective(1200px)_rotateY(0deg)_translateX(0)] backdrop-blur-lg'
              }`}
              style={{
                transformOrigin: 'right center',
              }}
            >
              <p className="text-white text-5xl font-bold tracking-wider text-right">BdR</p>
            </div>

            {/* Metade direita do livro - apenas coração branco bem colado no centro */}
            <div
              className={`fixed inset-y-0 right-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-start pl-4 md:pl-8 overflow-hidden transition-all duration-1000 ease-in-out ${
                bookOpenStage === 'opening'
                  ? 'w-0 opacity-0 [transform:perspective(1200px)_rotateY(-15deg)_translateX(30px)] backdrop-blur-xl'
                  : 'w-1/2 opacity-100 [transform:perspective(1200px)_rotateY(0deg)_translateX(0)] backdrop-blur-lg'
              }`}
              style={{
                transformOrigin: 'left center',
              }}
            >
              <svg className="w-20 h-20 text-white animate-pulse" fill="currentColor" viewBox="0 0 24 24" style={{ animationDuration: '1.2s' }}>
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>

            {/* Linha horizontal entre a sigla/coração e o "Carregando..." */}
            <div
              className={`fixed left-1/2 -translate-x-1/2 z-50 transition-all duration-700 ${
                bookOpenStage === 'opening' ? 'opacity-0 translate-y-4' : 'opacity-100'
              }`}
              style={{ bottom: '5.5rem' }}
            >
              <div className="w-64 h-[2px] bg-gradient-to-r from-white/10 via-pink-400/60 to-white/10 rounded-full"></div>
            </div>

            {/* Texto "Carregando..." abaixo */}
            <div
              className={`fixed bottom-12 left-1/2 -translate-x-1/2 z-50 transition-all duration-700 ${
                bookOpenStage === 'opening' ? 'opacity-0 translate-y-4' : 'opacity-100'
              }`}
            >
              <p className="text-white/60 text-sm font-medium tracking-wider animate-pulse">
                Carregando...
              </p>
            </div>
          </>
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

          <UpcomingEventsTicker />
          
          <div className="flex-1 px-4 md:px-8 pt-4 pb-4 overflow-hidden">
            {/* Desktop: grid com 3 colunas - altura total da tela */}
            <div className="flex flex-col gap-4 mt-0 h-full md:grid md:grid-cols-[1fr_auto_20rem] md:grid-rows-[auto_1fr] md:gap-x-4 md:gap-y-4">
              {/* Coluna 1: Mensagem (linha 1) */}
              <div className="md:col-start-1 md:row-start-1 md:row-span-1 min-h-0">
                <DailyMessageCard
                  key={selectedDate || 'today'}
                  message={dailyMessage}
                />
              </div>

              {/* Coluna 2: Nossa Jornada (mobile: abaixo da mensagem) */}
              <div className="md:col-start-2 md:row-start-1 md:row-span-1 min-h-0 md:block">
                <JourneyCard />
              </div>

              {/* Coluna 1: Versículo (linha 2) */}
              <div className="md:col-start-1 md:row-start-2 md:row-span-1 min-h-0 overflow-hidden">
                <DailyVerseCard
                  key={selectedDate || 'today'}
                  verse={dailyVerse}
                />
              </div>

              {/* Coluna 2: Galeria de Fotos (mobile: abaixo do versículo) */}
              <div className="md:col-start-2 md:row-start-2 md:row-span-1 min-h-0 overflow-hidden -mt-[165px] md:block">
                <PhotoGalleryCard />
              </div>

              {/* Coluna 3: Calendário iCloud (mobile: abaixo da galeria) */}
              <div className="md:col-start-3 md:row-start-1 md:row-span-2 min-h-0 overflow-hidden md:block">
                <ICloudCalendarWidget />
              </div>

              {/* Move PhotoGalleryCard to be visible on mobile here if needed, or remove existing hidden class */}
              <div className="md:hidden">
                <PhotoGalleryCard />
              </div>

              {/* Move JourneyCard to be visible on mobile here if needed, or remove existing hidden class */}
              <div className="md:hidden">
                <JourneyCard />
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
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setIsICloudCalendarModalOpen(false)}>
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
              <div className="relative bg-white/90 backdrop-blur-xl border border-white/30 rounded-2xl p-5 shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setIsICloudCalendarModalOpen(false)}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-10"
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
                  <CalendarEventsProvider>
                    <AppContent />
                  </CalendarEventsProvider>
                </TimePeriodProvider>
              </ProtectedRoute>
            }
          />
          <Route
            path="*"
            element={
              <TimePeriodProvider>
                <CalendarEventsProvider>
                  <AppContent />
                </CalendarEventsProvider>
              </TimePeriodProvider>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;