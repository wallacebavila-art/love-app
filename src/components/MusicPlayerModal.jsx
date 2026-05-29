import { useState } from 'react';

const MusicPlayerModal = ({ isOpen, onClose, isPlaying, onToggleMusic, onNextTrack, onPrevTrack, toggleShuffle, isShuffled, musicMode, toggleMusicMode, volume, onVolumeChange, currentTrack, currentArtist }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
      <div
        className="relative bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 shadow-2xl w-full max-w-sm animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header do Modal */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-semibold text-lg tracking-wide">🎵 Player de Música</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all"
          >
            <span className="material-symbols-outlined text-white text-[20px]">close</span>
          </button>
        </div>

        {/* Informações da Música */}
        <div className="bg-white/5 rounded-2xl p-4 mb-5 text-center">
          {currentTrack ? (
            <>
              <p className="text-white font-semibold text-lg truncate">{currentTrack}</p>
              {currentArtist && (
                <p className="text-white/60 text-sm mt-1 truncate">{currentArtist}</p>
              )}
            </>
          ) : (
            <p className="text-white/40 text-sm">Nenhuma música tocando</p>
          )}
        </div>

        {/* Controles Principais */}
        <div className="flex items-center justify-center gap-4 mb-5">
          <button
            onClick={(e) => { e.stopPropagation(); onPrevTrack(); }}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 transition-all hover:scale-110 active:scale-95"
            title="Música anterior"
          >
            <span className="material-symbols-outlined text-white text-[28px]">skip_previous</span>
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); onToggleMusic(); }}
            className="w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 active:scale-95 transition-all shadow-lg shadow-pink-500/30"
            title={isPlaying ? 'Pausar' : 'Tocar'}
          >
            <span className="material-symbols-outlined text-white text-[36px]">
              {isPlaying ? 'pause' : 'play_arrow'}
            </span>
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); onNextTrack(); }}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 transition-all hover:scale-110 active:scale-95"
            title="Próxima música"
          >
            <span className="material-symbols-outlined text-white text-[28px]">skip_next</span>
          </button>
        </div>

        {/* Controles Secundários */}
        <div className="flex items-center justify-center gap-3 mb-5">
          {/* Shuffle */}
          <button
            onClick={(e) => { e.stopPropagation(); toggleShuffle && toggleShuffle(); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              isShuffled
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-white/10 text-white/60 border border-white/10'
            }`}
            title="Modo aleatório"
          >
            <span className="material-symbols-outlined text-[16px]">shuffle</span>
            {isShuffled ? 'Ativado' : 'Aleatório'}
          </button>

          {/* Alternar Modo */}
          <button
            onClick={(e) => { e.stopPropagation(); toggleMusicMode && toggleMusicMode(); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              musicMode === 'youtube'
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
            }`}
            title={musicMode === 'youtube' ? 'Alternar para Local' : 'Alternar para YouTube'}
          >
            <span className="material-symbols-outlined text-[16px]">
              {musicMode === 'youtube' ? 'smart_display' : 'sd_card'}
            </span>
            {musicMode === 'youtube' ? 'YouTube' : 'Local'}
          </button>
        </div>

        {/* Volume */}
        <div className="bg-white/5 rounded-xl px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-white/50 text-[20px]">
              {volume === 0 ? 'volume_off' : volume < 50 ? 'volume_down' : 'volume_up'}
            </span>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => { e.stopPropagation(); onVolumeChange(parseInt(e.target.value)); }}
              className="flex-1 h-1.5 appearance-none bg-white/20 rounded-full cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-4
                [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:bg-gradient-to-br
                [&::-webkit-slider-thumb]:from-pink-400
                [&::-webkit-slider-thumb]:to-purple-500
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:shadow-md
                [&::-webkit-slider-thumb]:shadow-pink-500/30"
            />
            <span className="text-white/50 text-xs font-medium w-8 text-right">{volume}%</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center">
          <p className="text-white/30 text-[10px]">
            {musicMode === 'youtube'
              ? '🎬 Músicas da playlist do YouTube'
              : '💾 Músicas salvas localmente'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayerModal;