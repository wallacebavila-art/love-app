import { useState, useEffect, useCallback } from 'react';
import { useYouTubePlayer } from '../hooks/useYouTubePlayer';
import { useLocalAudioPlayer } from '../hooks/useLocalAudioPlayer';

/**
 * Hook principal que coordena os players de música (YouTube e Local)
 */
export const useMusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('musicVolume');
    return saved ? parseInt(saved) : 50;
  });
  const [musicMode, setMusicMode] = useState(() => {
    return localStorage.getItem('musicMode') || 'local';
  });

  // Estado do YouTube
  const [isYouTubeReady, setIsYouTubeReady] = useState(false);
  const [isLocalReady, setIsLocalReady] = useState(false);
  const [youtubeSelectedIndex, setYoutubeSelectedIndex] = useState(0);

  // Handlers para mudanças de estado
  const handleTrackChange = useCallback((track) => {
    // Atualiza estado quando a faixa muda
  }, []);

  const handlePlayingChange = useCallback((playing) => {
    setIsPlaying(playing);
  }, []);

  // Hook do YouTube
  const youtubePlayer = useYouTubePlayer({
    volume,
    autoPlay: musicMode === 'youtube' && isPlaying,
    onTrackChange: handleTrackChange,
    onPlayingChange: handlePlayingChange
  });

  // Hook do áudio local
  const localPlayer = useLocalAudioPlayer({
    volume,
    autoPlay: musicMode === 'local' && isPlaying,
    onTrackChange: handleTrackChange,
    onPlayingChange: handlePlayingChange
  });

  // Inicialização
  useEffect(() => {
    const savedMode = localStorage.getItem('musicMode') || 'local';
    setMusicMode(savedMode);

    if (savedMode === 'local') {
      localPlayer.loadSavedState();
      setIsLocalReady(true);
    } else {
      setIsYouTubeReady(true);
    }
  }, [localPlayer]);

  // Salvar volume
  useEffect(() => {
    localStorage.setItem('musicVolume', volume.toString());
  }, [volume]);

  // Alternar modo de música
  const toggleMusicMode = useCallback(() => {
    const wasPlaying = isPlaying;
    const newMode = musicMode === 'youtube' ? 'local' : 'youtube';
    
    // Pausar o modo atual antes de mudar
    if (musicMode === 'youtube' && isPlaying) {
      youtubePlayer.togglePlay();
    } else if (musicMode === 'local' && isPlaying) {
      localPlayer.togglePlay();
    }

    // Limpar o modo atual
    if (musicMode === 'youtube') {
      youtubePlayer.cleanup();
    }

    setMusicMode(newMode);
    localStorage.setItem('musicMode', newMode);
    setIsPlaying(false);

    // Inicializar o novo modo
    if (newMode === 'youtube') {
      setIsYouTubeReady(true);
      setTimeout(() => {
        if (wasPlaying) {
          setIsPlaying(true); // Atualiza estado antes de tentar tocar
          setTimeout(() => {
            youtubePlayer.togglePlay();
          }, 500);
        }
      }, 1500);
    } else {
      localPlayer.loadSavedState();
      setIsLocalReady(true);
      setTimeout(() => {
        if (wasPlaying) {
          setIsPlaying(true); // Atualiza estado antes de tentar tocar
          setTimeout(() => {
            localPlayer.togglePlay();
          }, 100);
        }
      }, 100);
    }
  }, [musicMode, isPlaying, youtubePlayer, localPlayer]);

  // Funções globais (delegam para o modo ativo)
  const toggleMusic = useCallback(() => {
    if (musicMode === 'youtube') {
      youtubePlayer.togglePlay();
    } else {
      localPlayer.togglePlay();
    }
  }, [musicMode, youtubePlayer, localPlayer]);

  const nextTrack = useCallback(() => {
    if (musicMode === 'youtube') {
      youtubePlayer.nextTrack();
    } else {
      localPlayer.nextTrack();
    }
  }, [musicMode, youtubePlayer, localPlayer]);

  const prevTrack = useCallback(() => {
    if (musicMode === 'youtube') {
      youtubePlayer.prevTrack();
    } else {
      localPlayer.prevTrack();
    }
  }, [musicMode, youtubePlayer, localPlayer]);

  const toggleShuffle = useCallback(() => {
    if (musicMode === 'local') {
      localPlayer.toggleShuffle();
    }
  }, [musicMode, localPlayer]);

  const selectTrack = useCallback((index) => {
    if (musicMode === 'youtube') {
      setYoutubeSelectedIndex(index);
      youtubePlayer.selectTrack(index);
    } else {
      localPlayer.selectTrack(index);
    }
  }, [musicMode, youtubePlayer, localPlayer]);

  // Dados do player ativo
  const currentTrack = musicMode === 'youtube' ? youtubePlayer.currentTrack : localPlayer.currentTrack;
  const currentArtist = musicMode === 'youtube' ? youtubePlayer.currentArtist : localPlayer.currentArtist;
  const isShuffled = musicMode === 'youtube' ? false : localPlayer.isShuffled;
  const currentTrackIndex = musicMode === 'youtube' ? youtubeSelectedIndex : localPlayer.currentTrackIndex;
  const totalTracks = musicMode === 'youtube' ? 0 : localPlayer.totalTracks;
  const playlistData = musicMode === 'youtube' ? [] : localPlayer.playlist;

  return {
    isPlaying,
    toggleMusic,
    nextTrack,
    prevTrack,
    toggleShuffle,
    isShuffled,
    musicMode,
    toggleMusicMode,
    volume,
    setVolume,
    currentTrack,
    currentArtist,
    currentTrackIndex,
    totalTracks,
    playlist: playlistData,
    selectTrack
  };
};