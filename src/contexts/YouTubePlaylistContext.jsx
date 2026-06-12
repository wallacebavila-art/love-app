import { createContext, useContext, useState, useEffect } from 'react';
import { fetchYouTubePlaylist, setSelectedPlaylistId, getSelectedPlaylistId } from '../services/youtubeService';
import { fetchPlaylists, addPlaylist as addPlaylistToFirestore, updatePlaylist as updatePlaylistInFirestore, removePlaylist as removePlaylistFromFirestore, initializeDefaultPlaylist } from '../services/playlistService';

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

  // Carregar playlists do Firestore
  useEffect(() => {
    const loadPlaylists = async () => {
      setLoading(true);
      try {
        // Inicializa playlist padrão se não existir
        await initializeDefaultPlaylist();
        
        // Carrega playlists do Firestore
        const fetchedPlaylists = await fetchPlaylists();
        setPlaylists(fetchedPlaylists);
      } catch (error) {
        console.error('Erro ao carregar playlists do Firestore:', error);
        setPlaylists(defaultPlaylists);
      } finally {
        setLoading(false);
      }
    };

    loadPlaylists();
  }, []);

  const selectPlaylist = (playlistId) => {
    setSelectedPlaylistIdState(playlistId);
    setSelectedPlaylistId(playlistId);
  };

  const addPlaylist = async (playlistId, name, description) => {
    const newPlaylist = {
      id: playlistId,
      name: name || 'Nova Playlist',
      description: description || 'Playlist personalizada'
    };

    try {
      const docRef = await addPlaylistToFirestore(newPlaylist);
      const updatedPlaylists = [...playlists, { ...newPlaylist, firestoreDocId: docRef.id }];
      setPlaylists(updatedPlaylists);
    } catch (error) {
      console.error('Erro ao adicionar playlist:', error);
    }
  };

  const removePlaylist = async (playlistId) => {
    // Encontra o documento ID no Firestore (não é o mesmo que playlistId)
    const playlistToRemove = playlists.find(p => p.id === playlistId);
    if (!playlistToRemove || !playlistToRemove.firestoreDocId) {
      console.error('Playlist não encontrada ou sem ID do Firestore');
      return;
    }

    try {
      await removePlaylistFromFirestore(playlistToRemove.firestoreDocId);
      const updatedPlaylists = playlists.filter(p => p.id !== playlistId);
      setPlaylists(updatedPlaylists);

      // Se a playlist removida era a selecionada, volta para a padrão
      if (selectedPlaylistId === playlistId) {
        selectPlaylist(defaultPlaylists[0].id);
      }
    } catch (error) {
      console.error('Erro ao remover playlist:', error);
    }
  };

  const editPlaylist = async (playlistId, name, description) => {
    // Encontra o documento ID no Firestore (não é o mesmo que playlistId)
    const playlistToEdit = playlists.find(p => p.id === playlistId);
    if (!playlistToEdit || !playlistToEdit.firestoreDocId) {
      console.error('Playlist não encontrada ou sem ID do Firestore');
      return;
    }

    try {
      await updatePlaylistInFirestore(playlistToEdit.firestoreDocId, {
        id: playlistId,
        name,
        description
      });
      const updatedPlaylists = playlists.map(p =>
        p.id === playlistId ? { ...p, name, description } : p
      );
      setPlaylists(updatedPlaylists);
    } catch (error) {
      console.error('Erro ao editar playlist:', error);
    }
  };

  const value = {
    playlists,
    selectedPlaylistId,
    selectPlaylist,
    addPlaylist,
    removePlaylist,
    editPlaylist,
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
