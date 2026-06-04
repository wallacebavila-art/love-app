import { createContext, useContext, useState, useEffect } from 'react';
import { fetchYouTubePlaylist, setSelectedPlaylistId, getSelectedPlaylistId } from '../services/youtubeService';

const YouTubePlaylistContext = createContext(null);

export const YouTubePlaylistProvider = ({ children }) => {
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylistId, setSelectedPlaylistIdState] = useState(getSelectedPlaylistId());
  const [loading, setLoading] = useState(false);

  // Playlists pré-definidas
  const defaultPlaylists = [
    {
      id: 'PL7Z2KjbeQrjT0TQw0_3JZAFJF9hhwdVOQ',
      name: 'Playlist Principal',
      description: 'Nossa playlist principal'
    }
  ];

  // Carregar playlists do localStorage
  useEffect(() => {
    try {
      const savedPlaylists = localStorage.getItem('youtubePlaylists');
      if (savedPlaylists) {
        setPlaylists(JSON.parse(savedPlaylists));
      } else {
        setPlaylists(defaultPlaylists);
      }
    } catch (error) {
      console.error('Erro ao carregar playlists do localStorage:', error);
      setPlaylists(defaultPlaylists);
    }
  }, []);

  const selectPlaylist = (playlistId) => {
    setSelectedPlaylistIdState(playlistId);
    setSelectedPlaylistId(playlistId);
  };

  const addPlaylist = (playlistId, name, description) => {
    const newPlaylist = {
      id: playlistId,
      name: name || 'Nova Playlist',
      description: description || 'Playlist personalizada'
    };

    const updatedPlaylists = [...playlists, newPlaylist];
    setPlaylists(updatedPlaylists);

    try {
      localStorage.setItem('youtubePlaylists', JSON.stringify(updatedPlaylists));
    } catch (error) {
      console.error('Erro ao salvar playlists no localStorage:', error);
    }
  };

  const removePlaylist = (playlistId) => {
    const updatedPlaylists = playlists.filter(p => p.id !== playlistId);
    setPlaylists(updatedPlaylists);

    try {
      localStorage.setItem('youtubePlaylists', JSON.stringify(updatedPlaylists));
    } catch (error) {
      console.error('Erro ao salvar playlists no localStorage:', error);
    }

    // Se a playlist removida era a selecionada, volta para a padrão
    if (selectedPlaylistId === playlistId) {
      selectPlaylist(defaultPlaylists[0].id);
    }
  };

  const value = {
    playlists,
    selectedPlaylistId,
    selectPlaylist,
    addPlaylist,
    removePlaylist,
    loading
  };

  return (
    <YouTubePlaylistContext.Provider value={value}>
      {children}
    </YouTubePlaylistContext.Provider>
  );
};

export const useYouTubePlaylist = () => {
  const context = useContext(YouTubePlaylistContext);
  if (!context) {
    throw new Error('useYouTubePlaylist must be used within a YouTubePlaylistProvider');
  }
  return context;
};
