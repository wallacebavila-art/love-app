import { useState, useEffect, useCallback } from 'react';
import { useYouTubePlayer } from './useYouTubePlayer';
import { useLocalAudioPlayer } from './useLocalAudioPlayer';
import { MAX_YOUTUBE_TRACKS } from '../constants/appConfig';

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
    try {
      localStorage.setItem('musicVolume', volume.toString());
    } catch (error) {
      console.error('Erro ao salvar volume no localStorage:', error);
    }
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
    try {
      localStorage.setItem('musicMode', newMode);
    } catch (error) {
      console.error('Erro ao salvar modo de música no localStorage:', error);
    }
    setIsPlaying(false);

    // Inicializar o novo modo
    if (newMode === 'youtube') {
      setIsYouTubeReady(true);
      const timeout1 = setTimeout(() => {
        if (wasPlaying) {
          setIsPlaying(true); // Atualiza estado antes de tentar tocar
          const timeout2 = setTimeout(() => {
            youtubePlayer.togglePlay();
          }, 500);
          // Cleanup para timeout2
          return () => clearTimeout(timeout2);
        }
      }, 1500);
      // Cleanup para timeout1
      return () => clearTimeout(timeout1);
    } else {
      localPlayer.loadSavedState();
      setIsLocalReady(true);
      const timeout1 = setTimeout(() => {
        if (wasPlaying) {
          setIsPlaying(true); // Atualiza estado antes de tentar tocar
          const timeout2 = setTimeout(() => {
            localPlayer.togglePlay();
          }, 100);
          // Cleanup para timeout2
          return () => clearTimeout(timeout2);
        }
      }, 100);
      // Cleanup para timeout1
      return () => clearTimeout(timeout1);
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
      // Atualizar o índice selecionado
      setYoutubeSelectedIndex(prev => (prev + 1) % MAX_YOUTUBE_TRACKS);
    } else {
      localPlayer.nextTrack();
    }
  }, [musicMode, youtubePlayer, localPlayer]);

  const prevTrack = useCallback(() => {
    if (musicMode === 'youtube') {
      youtubePlayer.prevTrack();
      // Atualizar o índice selecionado
      setYoutubeSelectedIndex(prev => (prev - 1 + MAX_YOUTUBE_TRACKS) % MAX_YOUTUBE_TRACKS);
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
  const totalTracks = musicMode === 'youtube' ? youtubePlayer.totalTracks : localPlayer.totalTracks;
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
