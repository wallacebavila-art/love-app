// YouTube Data API Service
import { YOUTUBE_API_KEY } from '../constants/appConfig';

export const fetchYouTubePlaylist = async (playlistId = null) => {
  try {
    // Se não for fornecido um playlistId, usa o valor padrão do localStorage ou do appConfig
    const defaultPlaylistId = localStorage.getItem('selectedPlaylistId') || import.meta.env.VITE_YOUTUBE_PLAYLIST_ID;
    const finalPlaylistId = playlistId || defaultPlaylistId;

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=50&playlistId=${finalPlaylistId}&key=${YOUTUBE_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    // Transformar os dados da API para o formato da playlist
    const playlist = data.items.map((item, index) => {
      const title = item.snippet.title;
      const channelTitle = item.snippet.videoOwnerChannelTitle || 'YouTube';
      const description = item.snippet.description || '';

      // Extrair artista da descrição (formato: "Música · Artista1 · Artista2")
      let artist = channelTitle;

      // Remover " - Topic" do nome do canal
      if (channelTitle.endsWith(' - Topic')) {
        artist = channelTitle.replace(' - Topic', '');
      }

      // Tentar extrair artista da descrição
      const descriptionMatch = description.match(/·\s*([^·\n]+)/);
      if (descriptionMatch && descriptionMatch[1]) {
        const extractedArtist = descriptionMatch[1].trim();
        // Usar o artista da descrição se não for muito longo
        if (extractedArtist.length > 0 && extractedArtist.length < 50) {
          artist = extractedArtist;
        }
      }

      return {
        id: index + 1,
        title: title,
        artist: artist,
        videoId: item.contentDetails.videoId
      };
    });

    return playlist;
  } catch (error) {
    console.error('Erro ao buscar playlist do YouTube:', error);
    return [];
  }
};

export const setYouTubeApiKey = (apiKey) => {
  try {
    localStorage.setItem('youtubeApiKey', apiKey);
  } catch (error) {
    console.error('Erro ao salvar API key no localStorage:', error);
  }
};

export const getYouTubeApiKey = () => {
  return localStorage.getItem('youtubeApiKey') || YOUTUBE_API_KEY;
};

export const setSelectedPlaylistId = (playlistId) => {
  try {
    localStorage.setItem('selectedPlaylistId', playlistId);
  } catch (error) {
    console.error('Erro ao salvar playlistId no localStorage:', error);
  }
};

export const getSelectedPlaylistId = () => {
  return localStorage.getItem('selectedPlaylistId') || import.meta.env.VITE_YOUTUBE_PLAYLIST_ID;
};
