import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import StatusBarSpacer from './components/StatusBarSpacer';
import Header from './components/Header';
import BottomPlayerBar from './components/BottomPlayerBar';
import NotificationToast, { NotificationProvider } from './components/NotificationToast';
import ToastProvider from './components/Toast';
import Login from './components/Login';
import RaissaLogin from './components/RaissaLogin';
import { useMusicPlayer } from './hooks/useMusicPlayer';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import UpcomingEventsTicker from './components/UpcomingEventsTicker';
import ProtectedRoute from './components/ProtectedRoute';
import { TimePeriodProvider, useTimePeriod } from './contexts/TimePeriodContext';
import { CalendarEventsProvider } from './contexts/CalendarEventsContext';
import { logger } from './utils/logger';
import { AuthProvider } from './contexts/AuthContext';
import { ModalProvider } from './contexts/ModalContext';
import { LoginModalProvider, useLoginModal } from './contexts/LoginModalContext';
import { NotificationModalProvider } from './contexts/NotificationModalContext';
import { DarkModeProvider } from './contexts/DarkModeContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { YouTubePlaylistProvider } from './contexts/YouTubePlaylistContext';
import { fetchDailyMessage } from './services/messageService';
import { fetchDailyVerse } from './services/verseService';
import { fetchWeather } from './services/weatherService';
import { requestNotificationPermission, scheduleDailyNotification, sendDailyMessageNotification, cancelDailyNotification } from './services/notificationService';
import { requestFCMToken, onForegroundMessage, showNotification } from './services/fcmService';
import { saveFCMToken } from './services/fcmTokenService';
// import { initAnalytics, trackPageView } from './services/analyticsService'; // Temporariamente desabilitado devido a problemas com dependências do Sentry
import './i18n/i18n';
import LoadingScreen from './components/LoadingScreen';
import MainContent from './components/MainContent';
import ModalsContainer from './components/ModalsContainer';
import ConnectionStatus from './components/ConnectionStatus';
import ErrorBoundary from './components/ErrorBoundary';
import { getThemeClasses, getSelectionClasses } from './utils/themeUtils';

function AppContent() {
  const { isPlaying, toggleMusic, nextTrack, prevTrack, toggleShuffle, isShuffled, musicMode, toggleMusicMode, volume, setVolume, currentTrack, currentArtist, currentTrackIndex, totalTracks, playlist, selectTrack, loadPlaylist } = useMusicPlayer();
  const [dailyMessage, setDailyMessage] = useState(null);
  const [dailyVerse, setDailyVerse] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isWeatherModalOpen, setIsWeatherModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isICloudCalendarModalOpen, setIsICloudCalendarModalOpen] = useState(false);
  const [isTravelMapModalOpen, setIsTravelMapModalOpen] = useState(false);
  const [isMusicPlayerModalOpen, setIsMusicPlayerModalOpen] = useState(false);
  const [isYoutubeDownloaderOpen, setIsYoutubeDownloaderOpen] = useState(false);
  const [isInterfaceHidden, setIsInterfaceHidden] = useState(false);
  const { isLoginModalOpen, setIsLoginModalOpen, isRaissaLoginModalOpen, setIsRaissaLoginModalOpen } = useLoginModal();
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

  // Inicializar analytics
  useEffect(() => {
    // initAnalytics(); // Temporariamente desabilitado devido a problemas com dependências do Sentry
  }, []);

  // Rastrear page views
  useEffect(() => {
    // trackPageView(location.pathname); // Temporariamente desabilitado devido a problemas com dependências do Sentry
  }, [location.pathname]);

  // Atalhos de teclado globais
  useKeyboardShortcuts({
    music: {
      toggle: toggleMusic,
      next: nextTrack,
      previous: prevTrack
    },
    calendar: {
      toggle: () => setIsCalendarOpen(prev => !prev)
    },
    settings: {
      toggle: () => setIsSettingsModalOpen(prev => !prev)
    },
    admin: {
      toggle: () => setIsAdminModalOpen(prev => !prev)
    },
    travel: {
      toggle: () => setIsTravelMapModalOpen(prev => !prev)
    },
    close: () => {
      setIsCalendarOpen(false);
      setIsSettingsModalOpen(false);
      setIsAdminModalOpen(false);
      setIsTravelMapModalOpen(false);
      setIsMusicPlayerModalOpen(false);
    }
  });

  // Abrir modal de admin quando rota for /admin
  useEffect(() => {
    if (location.pathname === '/admin') {
      setIsAdminModalOpen(true);
    }
  }, [location.pathname]);

  useEffect(() => {
    // Carregar preferência de interface escondida
    const savedInterfaceHidden = localStorage.getItem('interfaceHidden');
    if (savedInterfaceHidden) {
      try {
        setIsInterfaceHidden(JSON.parse(savedInterfaceHidden));
      } catch (error) {
        logger.error('Erro ao fazer parse de interfaceHidden:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Salvar preferência de interface escondida
    try {
      localStorage.setItem('interfaceHidden', JSON.stringify(isInterfaceHidden));
    } catch (error) {
      logger.error('Erro ao salvar interfaceHidden no localStorage:', error);
    }
  }, [isInterfaceHidden]);

  useEffect(() => {
    // Solicita permissão para notificações web
    requestNotificationPermission();

    // Solicita token FCM e salva no Firestore
    requestFCMToken().then(token => {
      if (token) {
        logger.log('Token FCM obtido com sucesso:', token);
        // Salva o token no Firestore para envio de notificações
        saveFCMToken(token);
      }
    });

    // Agenda notificação diária (web)
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
        logger.error('Erro ao carregar mensagem:', error);
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
        logger.error('Erro ao carregar versículo:', error);
        setDailyVerse({ text: 'Pensando...', reference: '' });
      }
    };

    loadVerse();
  }, []);

  useEffect(() => {
    let timer = null;
    let innerTimer = null;
    
    const checkLoadingComplete = () => {
      if (dailyMessage && dailyVerse) {
        timer = setTimeout(() => {
          // Iniciar animação de abertura do livro
          setBookOpenStage('opening');
          // Após a animação de abertura, remover loading
          innerTimer = setTimeout(() => {
            setBookOpenStage('open');
            setIsLoading(false);
          }, 1200);
        }, 2000);
      }
    };

    checkLoadingComplete();

    return () => {
      if (timer) clearTimeout(timer);
      if (innerTimer) clearTimeout(innerTimer);
    };
  }, [dailyMessage, dailyVerse]);



  const handleDateSelect = (dateKey, message, verse) => {
    logger.log('📅 Data selecionada:', dateKey, 'Mensagem:', message, 'Versículo:', verse);
    setSelectedDate(dateKey);
    if (message) {
      setDailyMessage(message);
    } else {
      logger.log('⚠️ Nenhuma mensagem para esta data');
      setDailyMessage('Pensando...');
    }
    if (verse) {
      setDailyVerse(verse);
    } else {
      logger.log('⚠️ Nenhum versículo para esta data');
      setDailyVerse({ text: 'Pensando...', reference: '' });
    }
  };

  return (
    <>
      <div className={`${getThemeClasses(period)} ${getSelectionClasses(period)} font-body-md min-h-screen overflow-x-hidden`}>
        {/* Tela de Carregamento com efeito de livro abrindo */}
        {(isLoading || bookOpenStage === 'opening') && <LoadingScreen bookOpenStage={bookOpenStage} />}
        
        {/* Hero Background Layer */}
        <div className="fixed inset-0 z-0">
          {/* Background image is applied via CSS theme classes */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#fbf9f5]/20"></div>
        </div>

        {/* Main Layout Container */}
        <div className={`relative z-10 flex flex-col min-h-screen transition-opacity duration-500 ${isInterfaceHidden ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <StatusBarSpacer />
          
          <ConnectionStatus />
          
          <Header
            onOpenCalendar={() => setIsCalendarOpen(true)}
            onOpenWeather={() => setIsWeatherModalOpen(true)}
            onOpenAdmin={() => setIsAdminModalOpen(true)}
            onOpenSettings={() => setIsSettingsModalOpen(true)}
            onOpenICloudCalendar={() => setIsICloudCalendarModalOpen(true)}
            onOpenTravelMap={() => setIsTravelMapModalOpen(true)}
            onOpenMusicPlayer={() => setIsMusicPlayerModalOpen(true)}
            isPlaying={isPlaying}
            onToggleMusic={toggleMusic}
            onNextTrack={nextTrack}
            onPrevTrack={prevTrack}
            toggleShuffle={toggleShuffle}
            isShuffled={isShuffled}
            musicMode={musicMode}
            toggleMusicMode={toggleMusicMode}
            volume={volume}
            onVolumeChange={setVolume}
            currentTrack={currentTrack}
            currentArtist={currentArtist}
            onToggleInterfaceHidden={() => setIsInterfaceHidden(!isInterfaceHidden)}
          />

          <UpcomingEventsTicker />
          
          <MainContent selectedDate={selectedDate} dailyMessage={dailyMessage} dailyVerse={dailyVerse} />

          <ModalsContainer
            isCalendarOpen={isCalendarOpen}
            setIsCalendarOpen={setIsCalendarOpen}
            isWeatherModalOpen={isWeatherModalOpen}
            setIsWeatherModalOpen={setIsWeatherModalOpen}
            isAdminModalOpen={isAdminModalOpen}
            setIsAdminModalOpen={setIsAdminModalOpen}
            isSettingsModalOpen={isSettingsModalOpen}
            setIsSettingsModalOpen={setIsSettingsModalOpen}
            isICloudCalendarModalOpen={isICloudCalendarModalOpen}
            setIsICloudCalendarModalOpen={setIsICloudCalendarModalOpen}
            isTravelMapModalOpen={isTravelMapModalOpen}
            setIsTravelMapModalOpen={setIsTravelMapModalOpen}
            isMusicPlayerModalOpen={isMusicPlayerModalOpen}
            setIsMusicPlayerModalOpen={setIsMusicPlayerModalOpen}
            isYoutubeDownloaderOpen={isYoutubeDownloaderOpen}
            setIsYoutubeDownloaderOpen={setIsYoutubeDownloaderOpen}
            isLoginModalOpen={isLoginModalOpen}
            setIsLoginModalOpen={setIsLoginModalOpen}
            isRaissaLoginModalOpen={isRaissaLoginModalOpen}
            setIsRaissaLoginModalOpen={setIsRaissaLoginModalOpen}
            weather={weather}
            handleDateSelect={handleDateSelect}
            isPlaying={isPlaying}
            toggleMusic={toggleMusic}
            nextTrack={nextTrack}
            prevTrack={prevTrack}
            toggleShuffle={toggleShuffle}
            isShuffled={isShuffled}
            musicMode={musicMode}
            toggleMusicMode={toggleMusicMode}
            volume={volume}
            setVolume={setVolume}
            currentTrack={currentTrack}
            currentArtist={currentArtist}
            currentTrackIndex={currentTrackIndex}
            totalTracks={totalTracks}
            playlist={playlist}
            selectTrack={selectTrack}
            loadPlaylist={loadPlaylist}
          />

          {/* Bottom Player Bar - Apenas no modo mobile */}
          <BottomPlayerBar
            isPlaying={isPlaying}
            onToggleMusic={toggleMusic}
            onNextTrack={nextTrack}
            onPrevTrack={prevTrack}
            toggleShuffle={toggleShuffle}
            isShuffled={isShuffled}
            musicMode={musicMode}
            toggleMusicMode={toggleMusicMode}
            volume={volume}
            onVolumeChange={setVolume}
            currentTrack={currentTrack}
            currentArtist={currentArtist}
            onOpenMusicPlayer={() => setIsMusicPlayerModalOpen(true)}
          />

          {/* Botão flutuante para reabrir interface quando escondida */}
          {isInterfaceHidden && (
            <button
              onClick={() => setIsInterfaceHidden(false)}
              className="fixed bottom-8 right-8 z-50 w-14 h-14 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center text-white hover:bg-white/30 hover:scale-110 transition-all shadow-2xl"
              title="Mostrar interface"
            >
              <span className="material-symbols-outlined text-2xl">visibility</span>
            </button>
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
        <ModalProvider>
          <LoginModalProvider>
            <NotificationModalProvider>
              <DarkModeProvider>
                <YouTubePlaylistProvider>
                  <TimePeriodProvider>
                    <ThemeProvider>
                      <CalendarEventsProvider>
                        <NotificationProvider>
                          <ToastProvider>
                            <ErrorBoundary>
                            <Routes>
                              <Route path="/login" element={<Login />} />
                              <Route path="/raissa-login" element={<RaissaLogin />} />
                              <Route
                                path="/admin"
                                element={
                                  <ProtectedRoute>
                                    <AppContent />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="*"
                                element={
                                  <AppContent />
                                }
                              />
                            </Routes>
                          </ErrorBoundary>
                        </ToastProvider>
                      </NotificationProvider>
                    </CalendarEventsProvider>
                  </ThemeProvider>
                </TimePeriodProvider>
              </YouTubePlaylistProvider>
            </DarkModeProvider>
            </NotificationModalProvider>
          </LoginModalProvider>
        </ModalProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;