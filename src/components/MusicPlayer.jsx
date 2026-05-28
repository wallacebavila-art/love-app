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

  // Inicializa o player do YouTube de forma assíncrona o quanto antes
  useEffect(() => {
    loadYouTubeAPI();

    let isMounted = true;
    waitForAPI().then(() => {
      if (!isMounted) return;
      if (playerRef.current) return;

      // Cria ou recupera o elemento div para o player
      let playerDiv = document.getElementById('youtube-player');
      if (!playerDiv) {
        playerDiv = document.createElement('div');
        playerDiv.id = 'youtube-player';
        document.body.appendChild(playerDiv);
      }

      // Estilização off-screen para iOS não bloquear iframe oculto (display: none/width: 0 bloqueiam reprodução)
      playerDiv.style.position = 'fixed';
      playerDiv.style.top = '-100px';
      playerDiv.style.left = '-100px';
      playerDiv.style.width = '1px';
      playerDiv.style.height = '1px';
      playerDiv.style.opacity = '0.01';
      playerDiv.style.pointerEvents = 'none';

      // Recuperar se deve tocar automaticamente com base no estado salvo
      const saved = localStorage.getItem('musicPlayer');
      const shouldAutoPlay = saved ? JSON.parse(saved).playing : false;

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
          playsinline: 1, // Essencial para rodar no background/inline no iOS
        },
        events: {
          onReady: () => {
            if (!isMounted) return;
            playerReadyRef.current = true;
            
            // Definir volume inicial
            const savedVol = localStorage.getItem('musicVolume');
            const initialVolume = savedVol ? parseInt(savedVol) : 50;
            playerRef.current.setVolume(initialVolume);

            updateTrackInfo();
            if (shouldAutoPlay) {
              setIsPlaying(true);
            }
          },
          onStateChange: (event) => {
            if (!isMounted) return;
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              updateTrackInfo();
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

    return () => {
      isMounted = false;
    };
  }, []);

  // Atualizar nome da música a cada 3 segundos enquanto toca
  useEffect(() => {
    if (isPlaying) {
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

  // Função síncrona para iniciar reprodução a partir de evento de clique (Crucial para iOS Safari/Chrome!)
  const toggleMusic = useCallback(() => {
    if (!playerRef.current || !playerReadyRef.current) {
      console.warn("Player do YouTube ainda não está pronto.");
      return;
    }

    if (!isPlaying) {
      // Chamada síncrona direta dentro do manipulador de evento de toque do usuário
      playerRef.current.playVideo();
      setIsPlaying(true);
    } else {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
    }
  }, [isPlaying]);

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
        try {
          playerRef.current.destroy();
        } catch (e) {
          // Ignorar erro na destruição
        }
        playerRef.current = null;
      }
      const playerDiv = document.getElementById('youtube-player');
      if (playerDiv) {
        try {
          document.body.removeChild(playerDiv);
        } catch (e) {
          // Ignorar
        }
      }
    };
  }, []);

  return { isPlaying, toggleMusic, nextTrack: nextTrack_, prevTrack: prevTrack_, volume, setVolume, currentTrack, currentArtist };
};
