import { useState, useEffect, useCallback, useRef } from 'react';
import { playlist } from '../data/playlist';

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Hook para gerenciar o player de áudio local
 * @param {Object} options - Opções do hook
 * @param {number} options.volume - Volume inicial (0-100)
 * @param {boolean} options.autoPlay - Se deve auto-play
 * @param {Function} options.onTrackChange - Callback quando a faixa muda
 * @param {Function} options.onPlayingChange - Callback quando o estado de playing muda
 */
export const useLocalAudioPlayer = ({ volume, autoPlay, onTrackChange, onPlayingChange }) => {
  const [currentTrack, setCurrentTrack] = useState('');
  const [currentArtist, setCurrentArtist] = useState('');
  const [isShuffled, setIsShuffled] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isReady, setIsReady] = useState(false);
  
  const audioRef = useRef(null);
  const shuffleOrderRef = useRef(null);
  const isChangingTrackRef = useRef(false);
  const BASE_PATH = import.meta.env.BASE_URL || '/';

  const getActualIndex = useCallback((shuffledIndex) => {
    if (isShuffled && shuffleOrderRef.current) {
      return shuffleOrderRef.current[shuffledIndex];
    }
    return shuffledIndex;
  }, [isShuffled]);

  const getShuffledIndex = useCallback((actualIndex) => {
    if (isShuffled && shuffleOrderRef.current) {
      return shuffleOrderRef.current.indexOf(actualIndex);
    }
    return actualIndex;
  }, [isShuffled]);

  const updateMediaSession = useCallback((track) => {
    if (!('mediaSession' in navigator)) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title || 'Tocando',
      artist: track.artist || 'Nossa Playlist',
      album: 'Nossa Playlist',
      artwork: track.cover
        ? [
            { src: track.cover, sizes: '96x96', type: 'image/jpeg' },
            { src: track.cover, sizes: '128x128', type: 'image/jpeg' },
            { src: track.cover, sizes: '256x256', type: 'image/jpeg' },
            { src: track.cover, sizes: '512x512', type: 'image/jpeg' },
          ]
        : [
            { src: `${BASE_PATH}favicon2.png`, sizes: '96x96', type: 'image/png' },
            { src: `${BASE_PATH}favicon2.png`, sizes: '128x128', type: 'image/png' },
            { src: `${BASE_PATH}favicon2.png`, sizes: '256x256', type: 'image/png' },
            { src: `${BASE_PATH}favicon2.png`, sizes: '512x512', type: 'image/png' },
          ]
    });
  }, [BASE_PATH]);

  const loadAndPlayTrack = useCallback((shouldPlay) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playlist.length === 0) {
      setCurrentTrack('');
      setCurrentArtist('');
      onPlayingChange?.(false);
      return;
    }

    const track = playlist[currentTrackIndex];
    if (!track) {
      setCurrentTrack('');
      setCurrentArtist('');
      onPlayingChange?.(false);
      return;
    }

    setCurrentTrack(track.title);
    setCurrentArtist(track.artist);
    onTrackChange?.({ title: track.title, artist: track.artist });
    
    isChangingTrackRef.current = true;
    
    audio.src = track.src;
    audio.load();
    audio.volume = volume / 100;

    updateMediaSession(track);

    if (shouldPlay) {
      const onCanPlay = () => {
        audio.removeEventListener('canplay', onCanPlay);
        audio.play().catch(error => {
          console.warn('Erro ao tocar:', error);
          onPlayingChange?.(false);
        }).finally(() => {
          isChangingTrackRef.current = false;
        });
      };
      audio.addEventListener('canplay', onCanPlay);
      
      setTimeout(() => {
        if (isChangingTrackRef.current) {
          isChangingTrackRef.current = false;
          audio.play().catch(error => {
            console.warn('Erro ao tocar (fallback):', error);
            onPlayingChange?.(false);
          });
        }
      }, 1000);
      onPlayingChange?.(true);
    } else {
      isChangingTrackRef.current = false;
    }
  }, [currentTrackIndex, volume, updateMediaSession, onTrackChange, onPlayingChange]);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;

    shuffleOrderRef.current = playlist.map((_, i) => i);

    const onEnded = () => {
      nextTrack();
    };

    const onError = (e) => {
      console.error('Erro ao carregar áudio:', e);
      onPlayingChange?.(false);
    };

    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    setIsReady(true);

    return () => {
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, [onPlayingChange]);

  useEffect(() => {
    if (!isReady) return;
    loadAndPlayTrack(autoPlay);
  }, [currentTrackIndex, isReady, autoPlay, loadAndPlayTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !isReady) return;

    if (isChangingTrackRef.current) return;

    if (autoPlay) {
      audio.play().catch(error => {
        console.warn('Erro ao resumir play:', error);
        onPlayingChange?.(false);
      });
    } else {
      audio.pause();
    }
  }, [autoPlay, isReady, onPlayingChange, loadAndPlayTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume / 100;
    }
  }, [volume]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (autoPlay) {
      audio.pause();
      onPlayingChange?.(false);
    } else {
      audio.play().catch(error => console.warn('Erro ao tocar:', error));
      onPlayingChange?.(true);
    }
  }, [autoPlay, onPlayingChange]);

  const nextTrack = useCallback(() => {
    const total = playlist.length;
    if (total === 0) return;
    const currentShuffledIndex = getShuffledIndex(currentTrackIndex);
    const nextShuffledIndex = (currentShuffledIndex + 1) % total;
    const nextActualIndex = getActualIndex(nextShuffledIndex);
    setCurrentTrackIndex(nextActualIndex);
  }, [currentTrackIndex, getShuffledIndex, getActualIndex]);

  const prevTrack = useCallback(() => {
    const total = playlist.length;
    if (total === 0) return;
    const currentShuffledIndex = getShuffledIndex(currentTrackIndex);
    const prevShuffledIndex = (currentShuffledIndex - 1 + total) % total;
    const prevActualIndex = getActualIndex(prevShuffledIndex);
    setCurrentTrackIndex(prevActualIndex);
  }, [currentTrackIndex, getShuffledIndex, getActualIndex]);

  const selectTrack = useCallback((index) => {
    if (index < 0 || index >= playlist.length) return;
    setCurrentTrackIndex(index);
  }, []);

  const toggleShuffle = useCallback(() => {
    if (!isShuffled) {
      const currentActualIndex = currentTrackIndex;
      const newOrder = shuffleArray(playlist.map((_, i) => i));
      const currentPos = newOrder.indexOf(currentActualIndex);
      if (currentPos !== -1) {
        newOrder[currentPos] = currentActualIndex;
        newOrder[0] = currentActualIndex;
        const rest = newOrder.slice(1);
        shuffleArray(rest);
        for (let i = 1; i < newOrder.length; i++) {
          newOrder[i] = rest[i - 1];
        }
      }
      shuffleOrderRef.current = newOrder;
      setIsShuffled(true);
    } else {
      setIsShuffled(false);
      shuffleOrderRef.current = playlist.map((_, i) => i);
    }
  }, [isShuffled, currentTrackIndex]);

  const loadSavedState = useCallback(() => {
    const saved = localStorage.getItem('musicPlayer');
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      if (parsed.currentIndex !== undefined && parsed.currentIndex < playlist.length) {
        setCurrentTrackIndex(parsed.currentIndex);
      }
      if (parsed.isShuffled) {
        setIsShuffled(true);
        if (parsed.shuffleOrder) {
          shuffleOrderRef.current = parsed.shuffleOrder;
        }
      }
    } catch (e) {}
  }, []);

  const saveState = useCallback(() => {
    const state = {
      currentIndex: currentTrackIndex,
      isShuffled: isShuffled,
      shuffleOrder: shuffleOrderRef.current,
    };
    localStorage.setItem('musicPlayer', JSON.stringify(state));
  }, [currentTrackIndex, isShuffled]);

  useEffect(() => {
    saveState();
  }, [currentTrackIndex, isShuffled, saveState]);

  return {
    currentTrack,
    currentArtist,
    isShuffled,
    currentTrackIndex,
    totalTracks: playlist.length,
    playlist,
    isReady,
    togglePlay,
    nextTrack,
    prevTrack,
    selectTrack,
    toggleShuffle,
    loadSavedState,
    saveState
  };
};
