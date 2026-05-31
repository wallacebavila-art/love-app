import { useState, useRef, useEffect } from 'react';
import { useNotificationModal } from '../contexts/NotificationModalContext';

const BottomPlayerBar = ({ isPlaying, onToggleMusic, onNextTrack, onPrevTrack, toggleShuffle, isShuffled, musicMode, toggleMusicMode, volume, onVolumeChange, currentTrack, currentArtist, onOpenMusicPlayer }) => {
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const volumeRef = useRef(null);
  const { isNotificationModalOpen } = useNotificationModal();

  // Fechar volume slider ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (volumeRef.current && !volumeRef.current.contains(event.target)) {
        setShowVolumeSlider(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isHidden) {
    return (
      <button
        onClick={() => setIsHidden(false)}
        className="fixed bottom-4 right-4 z-50 md:hidden w-10 h-10 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-xl border border-white/30 hover:bg-white/30 transition-all duration-300 active:scale-95 shadow-lg"
        title="Mostrar player"
      >
        <span className="material-symbols-outlined text-white text-[20px]">music_note</span>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 md:hidden bg-gradient-to-t from-black/80 to-black/60 backdrop-blur-xl border-t border-white/20 px-3 py-2 ${isNotificationModalOpen ? 'hidden' : ''}`}>
      <div className="flex items-center justify-between gap-2">
        {/* Informações da música */}
        <div className="flex-1 min-w-0">
          {isPlaying && currentTrack && (
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-white/80 text-[14px] animate-pulse">equalizer</span>
              <div className="max-w-[120px] sm:max-w-[180px] overflow-hidden flex items-center">
                <div className="animate-marquee whitespace-nowrap" style={{ animationDuration: '8s' }}>
                  <p className="text-white text-[10px] font-medium">
                    {currentArtist ? `${currentArtist} - ` : ''}{currentTrack}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Controles principais */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={(e) => { e.stopPropagation(); onPrevTrack(); }}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 transition-all duration-300 active:scale-95"
            title="Música anterior"
          >
            <span className="material-symbols-outlined text-white text-[16px]">skip_previous</span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleMusic(); }}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white hover:bg-white/90 active:bg-white/80 transition-all duration-300 active:scale-95 shadow-lg"
            title={isPlaying ? 'Pausar música' : 'Tocar música'}
          >
            <span className="material-symbols-outlined text-gray-900 text-[20px]">
              {isPlaying ? 'pause' : 'play_arrow'}
            </span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onNextTrack(); }}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 transition-all duration-300 active:scale-95"
            title="Próxima música"
          >
            <span className="material-symbols-outlined text-white text-[16px]">skip_next</span>
          </button>
        </div>

        {/* Controles secundários */}
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); toggleShuffle && toggleShuffle(); }}
            className={`w-7 h-7 flex items-center justify-center rounded-full transition-all duration-300 active:scale-95 ${
              isShuffled ? 'bg-green-500/80 text-white' : 'bg-white/10 text-white/80 hover:bg-white/20'
            }`}
            title={isShuffled ? 'Modo aleatório ativado' : 'Ativar modo aleatório'}
          >
            <span className="material-symbols-outlined text-[14px]">shuffle</span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); toggleMusicMode && toggleMusicMode(); }}
            className={`w-7 h-7 flex items-center justify-center rounded-full transition-all duration-300 active:scale-95 ${
              musicMode === 'youtube' ? 'bg-red-500/80 text-white' : 'bg-blue-500/80 text-white'
            }`}
            title={musicMode === 'youtube' ? 'Modo YouTube' : 'Modo Local'}
          >
            <span className="material-symbols-outlined text-[14px]">
              {musicMode === 'youtube' ? 'smart_display' : 'sd_card'}
            </span>
          </button>
          <div className="relative" ref={volumeRef}>
            <button
              onClick={(e) => { e.stopPropagation(); setShowVolumeSlider(!showVolumeSlider); }}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 transition-all duration-300 active:scale-95"
              title="Volume"
            >
              <span className="material-symbols-outlined text-[14px]">
                {volume === 0 ? 'volume_off' : volume < 50 ? 'volume_down' : 'volume_up'}
              </span>
            </button>
            {showVolumeSlider && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-xl p-2 z-[60] shadow-xl">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-white text-[12px]">
                    {volume === 0 ? 'volume_off' : 'volume_down'}
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => { e.stopPropagation(); onVolumeChange(parseInt(e.target.value)); }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-20 h-1 appearance-none bg-white/30 rounded-full cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md"
                  />
                  <span className="material-symbols-outlined text-white text-[12px]">
                    volume_up
                  </span>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onOpenMusicPlayer && onOpenMusicPlayer(); }}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 transition-all duration-300 active:scale-95"
            title="Abrir player completo"
          >
            <span className="material-symbols-outlined text-[14px]">equalizer</span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setIsHidden(true); }}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 transition-all duration-300 active:scale-95"
            title="Esconder player"
          >
            <span className="material-symbols-outlined text-[14px]">keyboard_arrow_down</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BottomPlayerBar;
