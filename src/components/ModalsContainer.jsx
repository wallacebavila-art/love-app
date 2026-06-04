/**
 * Componente de container de modais
 * 
 * Agrupa todos os modais do aplicativo em um único componente
 * para melhor organização do código.
 */

import { lazy, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import CalendarModal from './CalendarModal';
import WeatherModal from './WeatherModal';
import SettingsModal from './SettingsModal';
import NotificationToast from './NotificationToast';
import ICloudCalendarWidget from './ICloudCalendarWidget';
import Login from './Login';
import RaissaLogin from './RaissaLogin';
import YoutubeDownloader from './YoutubeDownloader';

// Code splitting para modais pesados
const AdminModal = lazy(() => import('./AdminModal'));
const TravelMapModal = lazy(() => import('./TravelMapModal'));
const MusicPlayerModal = lazy(() => import('./MusicPlayerModal'));

const ModalsContainer = ({
  isCalendarOpen,
  setIsCalendarOpen,
  isWeatherModalOpen,
  setIsWeatherModalOpen,
  isAdminModalOpen,
  setIsAdminModalOpen,
  isSettingsModalOpen,
  setIsSettingsModalOpen,
  isICloudCalendarModalOpen,
  setIsICloudCalendarModalOpen,
  isTravelMapModalOpen,
  setIsTravelMapModalOpen,
  isMusicPlayerModalOpen,
  setIsMusicPlayerModalOpen,
  isYoutubeDownloaderOpen,
  setIsYoutubeDownloaderOpen,
  isLoginModalOpen,
  setIsLoginModalOpen,
  isRaissaLoginModalOpen,
  setIsRaissaLoginModalOpen,
  weather,
  handleDateSelect,
  isPlaying,
  toggleMusic: toggleMusic,
  nextTrack,
  prevTrack,
  toggleShuffle,
  isShuffled,
  musicMode,
  toggleMusicMode: toggleMusicMode,
  volume,
  setVolume,
  currentTrack,
  currentArtist,
  currentTrackIndex,
  totalTracks,
  playlist,
  selectTrack,
}) => {
  const location = useLocation();

  return (
    <>
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

      <Suspense fallback={<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="animate-spin w-8 h-8 border-2 border-white/30 border-t-white rounded-full"></div>
      </div>}>
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
      </Suspense>

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onOpenYoutubeDownloader={() => setIsYoutubeDownloaderOpen(true)}
      />

      <Suspense fallback={<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="animate-spin w-8 h-8 border-2 border-white/30 border-t-white rounded-full"></div>
      </div>}>
        <TravelMapModal
          isOpen={isTravelMapModalOpen}
          onClose={() => setIsTravelMapModalOpen(false)}
        />
      </Suspense>

      <NotificationToast />

      {isICloudCalendarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setIsICloudCalendarModalOpen(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
          <div className="relative bg-transparent backdrop-blur-xl border-0 rounded-3xl p-4 shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setIsICloudCalendarModalOpen(false)}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-all hover:scale-110 z-10"
            >
              <span className="material-symbols-outlined text-white">close</span>
            </button>
            <ICloudCalendarWidget isModal={true} />
          </div>
        </div>
      )}

      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setIsLoginModalOpen(false)}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
          <div className="relative bg-white/80 backdrop-blur-[20px] -webkit-backdrop-blur-[20px] border border-white/50 rounded-3xl p-8 shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-10"
            >
              <span className="material-symbols-outlined text-gray-600">close</span>
            </button>
            <Login onClose={() => setIsLoginModalOpen(false)} isModal={true} />
          </div>
        </div>
      )}

      {isRaissaLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setIsRaissaLoginModalOpen(false)}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
          <div className="relative bg-white/80 backdrop-blur-[20px] -webkit-backdrop-blur-[20px] border border-white/50 rounded-3xl p-8 shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setIsRaissaLoginModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-10"
            >
              <span className="material-symbols-outlined text-gray-600">close</span>
            </button>
            <RaissaLogin onClose={() => setIsRaissaLoginModalOpen(false)} isModal={true} />
          </div>
        </div>
      )}

      <Suspense fallback={<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="animate-spin w-8 h-8 border-2 border-white/30 border-t-white rounded-full"></div>
      </div>}>
        <MusicPlayerModal
          isOpen={isMusicPlayerModalOpen}
          onClose={() => setIsMusicPlayerModalOpen(false)}
          isPlaying={isPlaying}
          onToggleMusic={toggleMusic}
          onNextTrack={nextTrack}
          onPrevTrack={prevTrack}
          onToggleShuffle={toggleShuffle}
          isShuffled={isShuffled}
          musicMode={musicMode}
          onToggleMusicMode={toggleMusicMode}
          volume={volume}
          onVolumeChange={setVolume}
          currentTrack={currentTrack}
          currentArtist={currentArtist}
          currentTrackIndex={currentTrackIndex}
          totalTracks={totalTracks}
          playlistData={playlist}
          onSelectTrack={selectTrack}
        />
      </Suspense>

      {isYoutubeDownloaderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setIsYoutubeDownloaderOpen(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
          <div className="relative bg-transparent backdrop-blur-xl border-0 rounded-3xl p-4 shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setIsYoutubeDownloaderOpen(false)}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-all hover:scale-110 z-10"
            >
              <span className="material-symbols-outlined text-white">close</span>
            </button>
            <YoutubeDownloader
              isOpen={true}
              onClose={() => setIsYoutubeDownloaderOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ModalsContainer;
