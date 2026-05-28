import { useState, useRef, useEffect, useCallback } from 'react';

const PLAYLIST_ID = 'PL7Z2KjbeQrjT0TQw0_3JZAFJF9hhwdVOQ';

// Carregar a API do YouTube
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

export const useMusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState('');
  const [currentArtist, setCurrentArtist] = useState('');
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('musicVolume');
    return saved ? parseInt(saved) : 50;
  });
  const playerRef = useRef(null);
  const playerReadyRef = useRef(false);
  const trackIntervalRef = useRef(null);

  // Carregar estado salvo e tentar iniciar player automaticamente
  useEffect(() => {
    const saved = localStorage.getItem('musicPlayer');
    if (saved) {
      const { playing } = JSON.parse(saved);
      if (playing) {
        setIsPlaying(true);
        loadYouTubeAPI();
        waitForAPI().then(() => {
          if (playerReadyRef.current) return;
          if (!playerRef.current) {
            const playerDiv = document.createElement('div');
            playerDiv.id = 'youtube-player';
            playerDiv.style.display = 'none';
            document.body.appendChild(playerDiv);
            playerRef.current = new window.YT.Player('youtube-player', {
              height: '0',
              width: '0',
              playerVars: {
                listType: 'playlist',
                list: PLAYLIST_ID,
                autoplay: 1,
                loop: 1,
                controls: 1,
                showinfo: 0,
                modestbranding: 1,
                playsinline: 1,
              },
              events: {
                onReady: () => {
                  playerReadyRef.current = true;
                  updateTrackInfo();
                },
                onStateChange: (event) => {
                  if (event.data === window.YT.PlayerState.PLAYING || event.data === window.YT.PlayerState.PAUSED) {
                    updateTrackInfo();
                  }
                },
                onError: () => {
                  console.log('Erro no player YouTube');
                },
              },
            });
          }
        });
      } else {
        setIsPlaying(false);
      }
    }
  }, []);

  // Atualizar nome da música a cada 3 segundos enquanto toca
  useEffect(() => {
    if (isPlaying && playerReadyRef.current) {
      trackIntervalRef.current = setInterval(updateTrackInfo, 3000);
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
  }, [isPlaying]);

  const updateTrackInfo = () => {
    try {
      if (playerRef.current && playerReadyRef.current) {
        const data = playerRef.current.getVideoData();
        if (data && data.title) {
          setCurrentTrack(data.title);
        }
        if (data && data.author) {
          setCurrentArtist(data.author);
        }
      }
    } catch (e) {
      // Ignorar erros de API
    }
  };

  // Salvar estado e volume
  useEffect(() => {
    localStorage.setItem('musicPlayer', JSON.stringify({ playing: isPlaying }));
  }, [isPlaying]);

  useEffect(() => {
    localStorage.setItem('musicVolume', volume.toString());
    if (playerRef.current && playerReadyRef.current) {
      playerRef.current.setVolume(volume);
    }
  }, [volume]);

  // Carregar API do YouTube
  useEffect(() => {
    loadYouTubeAPI();
  }, []);

  const resumeMusic = useCallback(async () => {
    await waitForAPI();

    if (!playerRef.current) {
      const playerDiv = document.createElement('div');
      playerDiv.id = 'youtube-player';
      playerDiv.style.display = 'none';
      document.body.appendChild(playerDiv);

      playerRef.current = new window.YT.Player('youtube-player', {
        height: '0',
        width: '0',
        playerVars: {
          listType: 'playlist',
          list: PLAYLIST_ID,
          autoplay: 1,
          loop: 1,
          controls: 1,
          showinfo: 0,
          modestbranding: 1,
          playsinline: 1,
        },
        events: {
          onReady: () => {
            playerReadyRef.current = true;
            updateTrackInfo();
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING || event.data === window.YT.PlayerState.PAUSED) {
              updateTrackInfo();
            }
          },
          onError: () => {
            console.log('Erro no player YouTube');
          },
        },
      });
    } else if (playerReadyRef.current) {
      playerRef.current.playVideo();
    } else {
      const checkReady = setInterval(() => {
        if (playerReadyRef.current) {
          clearInterval(checkReady);
          playerRef.current.playVideo();
        }
      }, 100);
    }
  }, []);

  const toggleMusic = useCallback(async () => {
    if (!isPlaying) {
      await resumeMusic();
      setIsPlaying(true);
    } else {
      if (playerRef.current && playerReadyRef.current) {
        playerRef.current.pauseVideo();
      }
      setIsPlaying(false);
    }
  }, [isPlaying, resumeMusic]);

  const nextTrack_ = useCallback(() => {
    if (playerRef.current && playerReadyRef.current) {
      playerRef.current.nextVideo();
      setTimeout(updateTrackInfo, 500);
    }
  }, []);

  const prevTrack_ = useCallback(() => {
    if (playerRef.current && playerReadyRef.current) {
      playerRef.current.previousVideo();
      setTimeout(updateTrackInfo, 500);
    }
  }, []);

  // Limpar ao desmontar
  useEffect(() => {
    return () => {
      if (trackIntervalRef.current) {
        clearInterval(trackIntervalRef.current);
      }
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      const playerDiv = document.getElementById('youtube-player');
      if (playerDiv) {
        document.body.removeChild(playerDiv);
      }
    };
  }, []);

  return { isPlaying, toggleMusic, nextTrack: nextTrack_, prevTrack: prevTrack_, volume, setVolume, currentTrack, currentArtist };
};