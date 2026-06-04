import { useState, useEffect, useCallback, useRef } from 'react';
import { YOUTUBE_API_KEY, YOUTUBE_PLAYLIST_ID, YOUTUBE_TRACK_UPDATE_DELAY_1, YOUTUBE_TRACK_UPDATE_DELAY_2 } from '../constants/appConfig';

let youtubeApiLoaded = false;
const apiReadyCallbacks = [];

function onYouTubeIframeAPIReady() {
  youtubeApiLoaded = true;
  apiReadyCallbacks.forEach(cb => cb());
  apiReadyCallbacks.length = 0;
}

function loadYouTubeAPI() {
  if (document.getElementById('youtube-api')) return;
  
  // Interceptar mensagens do YouTube para silenciar logs
  const originalPostMessage = window.postMessage;
  window.postMessage = function(message, targetOrigin, transfer) {
    if (typeof message === 'string' && message.includes('content script received message')) {
      return;
    }
    return originalPostMessage.call(this, message, targetOrigin, transfer);
  };
  
  const tag = document.createElement('script');
  tag.id = 'youtube-api';
  tag.src = 'https://www.youtube.com/iframe_api';
  const firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
  
  // Restaurar postMessage após carregar
  setTimeout(() => {
    window.postMessage = originalPostMessage;
  }, 3000);
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

/**
 * Hook para gerenciar o player do YouTube
 * @param {Object} options - Opções do hook
 * @param {number} options.volume - Volume inicial (0-100)
 * @param {boolean} options.autoPlay - Se deve auto-play
 * @param {Function} options.onTrackChange - Callback quando a faixa muda
 * @param {Function} options.onPlayingChange - Callback quando o estado de playing muda
 */
export const useYouTubePlayer = ({ volume, autoPlay, onTrackChange, onPlayingChange }) => {
  const [currentTrack, setCurrentTrack] = useState('');
  const [currentArtist, setCurrentArtist] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [totalTracks, setTotalTracks] = useState(0);
  
  const playerRef = useRef(null);
  const playerReadyRef = useRef(false);
  const trackIntervalRef = useRef(null);

  const updateTrackInfo = useCallback(() => {
    try {
      if (playerRef.current && playerReadyRef.current) {
        const data = playerRef.current.getVideoData();
        if (data && data.title) {
          setCurrentTrack(data.title);
          onTrackChange?.({ title: data.title, artist: data.author || '' });
        }
        if (data && data.author) {
          setCurrentArtist(data.author);
        }
      }
    } catch (e) {}
  }, [onTrackChange]);

  useEffect(() => {
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

      playerRef.current = new window.YT.Player('youtube-player', {
        height: '1',
        width: '1',
        playerVars: {
          listType: 'playlist',
          list: YOUTUBE_PLAYLIST_ID,
          autoplay: autoPlay ? 1 : 0,
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
            setIsReady(true);
            playerRef.current.setVolume(volume);
            updateTrackInfo();
            
            // Obter número total de vídeos na playlist
            if (playerRef.current.getPlaylist && playerRef.current.getPlaylist()) {
              const playlist = playerRef.current.getPlaylist();
              setTotalTracks(playlist.length || 0);
            }
            
            if (autoPlay) {
              onPlayingChange?.(true);
            }
          },
          onStateChange: (event) => {
            if (!isMounted) return;
            if (event.data === window.YT.PlayerState.PLAYING) {
              onPlayingChange?.(true);
              updateTrackInfo();
            } else if (event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.ENDED) {
              onPlayingChange?.(false);
            } else if (event.data === window.YT.PlayerState.CUED) {
              // Quando o vídeo é carregado, atualizar info
              updateTrackInfo();
            }
          },
          onError: (e) => {
            console.error('Erro no player YouTube:', e);
          },
        },
      });
    });

    return () => { isMounted = false; };
  }, [autoPlay, volume, updateTrackInfo, onPlayingChange]);

  useEffect(() => {
    if (playerRef.current && playerReadyRef.current) {
      playerRef.current.setVolume(volume);
    }
  }, [volume]);

  const togglePlay = useCallback(() => {
    if (!playerRef.current || !playerReadyRef.current) return;
    if (!isReady) return;
    
    if (playerRef.current.getPlayerState() === window.YT.PlayerState.PLAYING) {
      playerRef.current.pauseVideo();
      onPlayingChange?.(false);
    } else {
      playerRef.current.playVideo();
      onPlayingChange?.(true);
    }
  }, [isReady, onPlayingChange]);

  const nextTrack = useCallback(() => {
    if (playerRef.current && playerReadyRef.current) {
      playerRef.current.nextVideo();
      // A atualização de info será feita via onStateChange
    }
  }, []);

  const prevTrack = useCallback(() => {
    if (playerRef.current && playerReadyRef.current) {
      playerRef.current.previousVideo();
      // A atualização de info será feita via onStateChange
    }
  }, []);

  const selectTrack = useCallback((index) => {
    if (playerRef.current && playerReadyRef.current) {
      playerRef.current.playVideoAt(index);
      // A atualização de info será feita via onStateChange
      onPlayingChange?.(true);
    }
  }, [onPlayingChange]);

  const cleanup = useCallback(() => {
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
    setIsReady(false);
  }, []);

  return {
    currentTrack,
    currentArtist,
    isReady,
    togglePlay,
    nextTrack,
    prevTrack,
    selectTrack,
    cleanup,
    totalTracks
  };
};
