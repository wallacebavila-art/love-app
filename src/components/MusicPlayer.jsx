import { useState, useRef, useEffect, useCallback } from 'react';
import { playlist } from '../data/playlist';

// ============================================================
// YOUTUBE API
// ============================================================
const PLAYLIST_ID = 'PL7Z2KjbeQrjT0TQw0_3JZAFJF9hhwdVOQ';

let youtubeApiLoaded = false;
const apiReadyCallbacks = [];

function onYouTubeIframeAPIReady() {
  youtubeApiLoaded = true;
  apiReadyCallbacks.forEach(cb => cb());
  apiReadyCallbacks.length = 0;
}

function loadYouTubeAPI() {
  if (document.getElementById('youtube-api')) return;
  const tag = document.createElement('script');
  tag.id = 'youtube-api';
  tag.src = 'https://www.youtube.com/iframe_api';
  const firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
}

function waitForAPI() {
  return new Promise((resolve) => {
    if (youtubeApiLoaded || (window.YT && window.YT.Player)) {
      youtubeApiLoaded = true;
      resolve();
    } else {
      apiReadyCallbacks.push(resolve);
    }
  });
}

// ============================================================
// LOCAL AUDIO HELPERS
// ============================================================
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ============================================================
// HOOK PRINCIPAL
// ============================================================
export const useMusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState('');
  const [currentArtist, setCurrentArtist] = useState('');
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('musicVolume');
    return saved ? parseInt(saved) : 50;
  });
  const [isShuffled, setIsShuffled] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [musicMode, setMusicMode] = useState(() => {
    return localStorage.getItem('musicMode') || 'local';
  });
  
  // YouTube refs
  const playerRef = useRef(null);
  const playerReadyRef = useRef(false);
  const trackIntervalRef = useRef(null);
  
  // Local audio refs
  const audioRef = useRef(null);
  const shuffleOrderRef = useRef(null);
  // Flag para evitar loop entre loadAndPlayTrack e o useEffect de isPlaying
  const isChangingTrackRef = useRef(false);

  // ============================================================
  // INICIALIZAÇÃO
  // ============================================================
  useEffect(() => {
    const savedMode = localStorage.getItem('musicMode') || 'local';
    setMusicMode(savedMode);

    if (savedMode === 'youtube') {
      initYouTube();
    } else {
      initLocalAudio();
    }

    loadSavedState();

    return () => {
      cleanupYouTube();
      cleanupLocalAudio();
    };
  }, []);

  // ============================================================
  // YOUTUBE INIT
  // ============================================================
  const initYouTube = () => {
    loadYouTubeAPI();

    let isMounted = true;
    waitForAPI().then(() => {
      if (!isMounted) return;
      if (playerRef.current) return;

      let playerDiv = document.getElementById('youtube-player');
      if (!playerDiv) {
        playerDiv = document.createElement('div');
        playerDiv.id = 'youtube-player';
        document.body.appendChild(playerDiv);
      }

      playerDiv.style.position = 'fixed';
      playerDiv.style.top = '-100px';
      playerDiv.style.left = '-100px';
      playerDiv.style.width = '1px';
      playerDiv.style.height = '1px';
      playerDiv.style.opacity = '0.01';
      playerDiv.style.pointerEvents = 'none';

      const saved = localStorage.getItem('musicPlayer');
      const shouldAutoPlay = saved && musicMode === 'youtube' ? JSON.parse(saved).playing : false;

      playerRef.current = new window.YT.Player('youtube-player', {
        height: '1',
        width: '1',
        playerVars: {
          listType: 'playlist',
          list: PLAYLIST_ID,
          autoplay: shouldAutoPlay ? 1 : 0,
          loop: 1,
          controls: 1,
          showinfo: 0,
          modestbranding: 1,
          playsinline: 1,
        },
        events: {
          onReady: () => {
            if (!isMounted) return;
            playerReadyRef.current = true;
            playerRef.current.setVolume(volume);
            updateTrackInfoYT();
            if (shouldAutoPlay) {
              setIsPlaying(true);
            }
          },
          onStateChange: (event) => {
            if (!isMounted) return;
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              updateTrackInfoYT();
            } else if (event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.ENDED) {
              setIsPlaying(false);
            }
          },
          onError: (e) => {
            console.log('Erro no player YouTube:', e);
          },
        },
      });
    });

    return () => { isMounted = false; };
  };

  // ============================================================
  // LOCAL AUDIO INIT
  // ============================================================
  const initLocalAudio = () => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;

    shuffleOrderRef.current = playlist.map((_, i) => i);

    const onEnded = () => {
      nextTrackLocal();
    };

    const onError = (e) => {
      console.error('Erro ao carregar áudio:', e);
      setIsPlaying(false);
    };

    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);
  };

  // ============================================================
  // LIMPEZA
  // ============================================================
  const cleanupYouTube = () => {
    if (trackIntervalRef.current) {
      clearInterval(trackIntervalRef.current);
      trackIntervalRef.current = null;
    }
    if (playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch (e) {}
      playerRef.current = null;
    }
    const playerDiv = document.getElementById('youtube-player');
    if (playerDiv) {
      try {
        document.body.removeChild(playerDiv);
      } catch (e) {}
    }
    playerReadyRef.current = false;
  };

  const cleanupLocalAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
  };

  // ============================================================
  // CARREGAR ESTADO SALVO
  // ============================================================
  const loadSavedState = () => {
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
  };

  // ============================================================
  // ALTERNAR MODO
  // ============================================================
  const toggleMusicMode = useCallback(() => {
    const wasPlaying = isPlaying;
    
    if (isPlaying) {
      if (musicMode === 'youtube' && playerRef.current && playerReadyRef.current) {
        playerRef.current.pauseVideo();
      } else if (musicMode === 'local' && audioRef.current) {
        audioRef.current.pause();
      }
    }

    if (musicMode === 'youtube') {
      cleanupYouTube();
    } else {
      cleanupLocalAudio();
    }

    const newMode = musicMode === 'youtube' ? 'local' : 'youtube';
    setMusicMode(newMode);
    localStorage.setItem('musicMode', newMode);
    setIsPlaying(false);
    setCurrentTrack('');
    setCurrentArtist('');

    if (newMode === 'youtube') {
      initYouTube();
      setTimeout(() => {
        if (wasPlaying && playerRef.current && playerReadyRef.current) {
          playerRef.current.playVideo();
          setIsPlaying(true);
        }
      }, 1500);
    } else {
      initLocalAudio();
      setTimeout(() => {
        if (playlist[currentTrackIndex]) {
          const track = playlist[currentTrackIndex];
          setCurrentTrack(track.title);
          setCurrentArtist(track.artist);
          if (audioRef.current) {
            audioRef.current.src = track.src;
            audioRef.current.load();
            audioRef.current.volume = volume / 100;
            updateMediaSession(track);
            if (wasPlaying) {
              isChangingTrackRef.current = true;
              audioRef.current.play().catch(() => {});
              setIsPlaying(true);
            }
          }
        }
      }, 100);
    }
  }, [musicMode, isPlaying, currentTrackIndex, volume]);

  // ============================================================
  // YOUTUBE FUNCTIONS
  // ============================================================
  const updateTrackInfoYT = () => {
    try {
      if (playerRef.current && playerReadyRef.current) {
        const data = playerRef.current.getVideoData();
        if (data && data.title) setCurrentTrack(data.title);
        if (data && data.author) setCurrentArtist(data.author);
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (musicMode !== 'youtube') return;
    if (isPlaying) {
      trackIntervalRef.current = setInterval(updateTrackInfoYT, 3000);
    } else {
      if (trackIntervalRef.current) {
        clearInterval(trackIntervalRef.current);
        trackIntervalRef.current = null;
      }
    }
    return () => {
      if (trackIntervalRef.current) {
        clearInterval(trackIntervalRef.current);
      }
    };
  }, [isPlaying, musicMode]);

  useEffect(() => {
    if (musicMode !== 'youtube') return;
    if (playerRef.current && playerReadyRef.current) {
      playerRef.current.setVolume(volume);
    }
  }, [volume, musicMode]);

  const toggleMusicYT = useCallback(() => {
    if (!playerRef.current || !playerReadyRef.current) return;
    if (!isPlaying) {
      playerRef.current.playVideo();
      setIsPlaying(true);
    } else {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
    }
  }, [isPlaying]);

  const nextTrackYT = useCallback(() => {
    if (playerRef.current && playerReadyRef.current) {
      playerRef.current.nextVideo();
      setTimeout(updateTrackInfoYT, 500);
    }
  }, []);

  const prevTrackYT = useCallback(() => {
    if (playerRef.current && playerReadyRef.current) {
      playerRef.current.previousVideo();
      setTimeout(updateTrackInfoYT, 500);
    }
  }, []);

  // ============================================================
  // LOCAL AUDIO FUNCTIONS
  // ============================================================
  // Carrega e toca a faixa atual
  const loadAndPlayTrack = useCallback((shouldPlay) => {
    if (musicMode !== 'local') return;
    const audio = audioRef.current;
    if (!audio) return;

    if (playlist.length === 0) {
      setCurrentTrack('');
      setCurrentArtist('');
      setIsPlaying(false);
      return;
    }

    const track = playlist[currentTrackIndex];
    if (!track) {
      setCurrentTrack('');
      setCurrentArtist('');
      setIsPlaying(false);
      return;
    }

    setCurrentTrack(track.title);
    setCurrentArtist(track.artist);
    
    isChangingTrackRef.current = true;
    
    audio.src = track.src;
    audio.load();
    audio.volume = volume / 100;

    updateMediaSession(track);

    if (shouldPlay) {
      // Aguarda o áudio carregar antes de tentar tocar
      const onCanPlay = () => {
        audio.removeEventListener('canplay', onCanPlay);
        audio.play().catch(error => {
          console.warn('Erro ao tocar:', error);
          setIsPlaying(false);
        }).finally(() => {
          isChangingTrackRef.current = false;
        });
      };
      audio.addEventListener('canplay', onCanPlay);
      // Fallback: tenta tocar mesmo se não disparar canplay
      setTimeout(() => {
        if (isChangingTrackRef.current) {
          isChangingTrackRef.current = false;
          audio.play().catch(error => {
            console.warn('Erro ao tocar (fallback):', error);
            setIsPlaying(false);
          });
        }
      }, 1000);
      setIsPlaying(true);
    } else {
      isChangingTrackRef.current = false;
    }
  }, [currentTrackIndex, musicMode, volume]);

  // Quando a faixa ou modo muda
  useEffect(() => {
    if (musicMode === 'local') {
      loadAndPlayTrack(isPlaying);
    }
  }, [currentTrackIndex, musicMode]);

  // Quando isPlaying muda (play/pause toggle)
  useEffect(() => {
    if (musicMode !== 'local') return;
    const audio = audioRef.current;
    if (!audio) return;

    if (isChangingTrackRef.current) return;

    if (isPlaying) {
      audio.play().catch(error => {
        console.warn('Erro ao resumir play:', error);
        setIsPlaying(false);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, musicMode]);

  useEffect(() => {
    if (musicMode !== 'local') return;
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume / 100;
  }, [volume, musicMode]);

  // Media Session API
  const BASE_PATH = import.meta.env.BASE_URL || '/';
  const updateMediaSession = (track) => {
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

    navigator.mediaSession.setActionHandler('play', () => toggleMusic());
    navigator.mediaSession.setActionHandler('pause', () => toggleMusic());
    navigator.mediaSession.setActionHandler('previoustrack', () => prevTrack());
    navigator.mediaSession.setActionHandler('nexttrack', () => nextTrack());
  };

  // Local helpers
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

  const toggleShuffleLocal = useCallback(() => {
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
    saveState();
  }, [isShuffled, currentTrackIndex]);

  const nextTrackLocal = useCallback(() => {
    const total = playlist.length;
    if (total === 0) return;
    const currentShuffledIndex = getShuffledIndex(currentTrackIndex);
    const nextShuffledIndex = (currentShuffledIndex + 1) % total;
    const nextActualIndex = getActualIndex(nextShuffledIndex);
    setCurrentTrackIndex(nextActualIndex);
  }, [currentTrackIndex, getShuffledIndex, getActualIndex]);

  const prevTrackLocal = useCallback(() => {
    const total = playlist.length;
    if (total === 0) return;
    const currentShuffledIndex = getShuffledIndex(currentTrackIndex);
    const prevShuffledIndex = (currentShuffledIndex - 1 + total) % total;
    const prevActualIndex = getActualIndex(prevShuffledIndex);
    setCurrentTrackIndex(prevActualIndex);
  }, [currentTrackIndex, getShuffledIndex, getActualIndex]);

  const selectTrackLocal = useCallback((index) => {
    if (index < 0 || index >= playlist.length) return;
    setCurrentTrackIndex(index);
  }, []);

  // ============================================================
  // FUNÇÕES GLOBAIS (delegam para o modo ativo)
  // ============================================================
  const toggleMusic = useCallback(() => {
    if (musicMode === 'youtube') {
      toggleMusicYT();
    } else {
      const audio = audioRef.current;
      if (!audio) {
        console.warn("Player de áudio ainda não está pronto.");
        return;
      }
      if (!isPlaying) {
        audio.play().catch(error => console.warn('Erro ao tocar:', error));
        setIsPlaying(true);
      } else {
        audio.pause();
        setIsPlaying(false);
      }
    }
  }, [musicMode, isPlaying, toggleMusicYT]);

  const nextTrack = useCallback(() => {
    if (musicMode === 'youtube') {
      nextTrackYT();
    } else {
      nextTrackLocal();
    }
  }, [musicMode, nextTrackYT, nextTrackLocal]);

  const prevTrack = useCallback(() => {
    if (musicMode === 'youtube') {
      prevTrackYT();
    } else {
      prevTrackLocal();
    }
  }, [musicMode, prevTrackYT, prevTrackLocal]);

  const toggleShuffle = useCallback(() => {
    if (musicMode === 'local') {
      toggleShuffleLocal();
    }
  }, [musicMode, toggleShuffleLocal]);

  const selectTrack = useCallback((index) => {
    if (musicMode === 'local') {
      selectTrackLocal(index);
    } else if (musicMode === 'youtube') {
      if (playerRef.current && playerReadyRef.current) {
        playerRef.current.playVideoAt(index);
        setTimeout(updateTrackInfoYT, 500);
      }
    }
  }, [musicMode, selectTrackLocal]);

  // Salvar estado
  const saveState = () => {
    const state = {
      playing: isPlaying,
      currentIndex: currentTrackIndex,
      isShuffled: isShuffled,
      shuffleOrder: shuffleOrderRef.current,
    };
    localStorage.setItem('musicPlayer', JSON.stringify(state));
  };

  useEffect(() => {
    saveState();
  }, [isPlaying, currentTrackIndex, isShuffled]);

  useEffect(() => {
    localStorage.setItem('musicVolume', volume.toString());
  }, [volume]);

  // ============================================================
  // RETURN
  // ============================================================
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
    totalTracks: playlist.length,
    playlist,
    selectTrack
  };
};