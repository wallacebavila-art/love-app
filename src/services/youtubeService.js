// YouTube Data API Service
const YOUTUBE_API_KEY = 'AIzaSyBqe0OxrOdjIPY1pCaMwr8e3Kf-WcCDeGA'; // Substitua com sua API key do YouTube Data API
const PLAYLIST_ID = 'PL7Z2KjbeQrjT0TQw0_3JZAFJF9hhwdVOQ';

export const fetchYouTubePlaylist = async () => {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=50&playlistId=${PLAYLIST_ID}&key=${YOUTUBE_API_KEY}`
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
  // Em produção, isso deveria ser configurado via variável de ambiente
  // Por enquanto, vamos armazenar no localStorage para facilitar
  localStorage.setItem('youtubeApiKey', apiKey);
};

export const getYouTubeApiKey = () => {
  return localStorage.getItem('youtubeApiKey') || YOUTUBE_API_KEY;
};
