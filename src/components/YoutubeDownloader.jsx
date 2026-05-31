import { useState } from 'react';
import { useThemeStyles } from '../hooks/useThemeStyles';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const YoutubeDownloader = ({ onClose, onMusicDownloaded }) => {
  const { getCardBackground, getBorderColor, getTextColor } = useThemeStyles();
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'downloading' | 'converting' | 'success' | 'error'
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState(0);

  const handleDownload = async () => {
    if (!url.trim()) {
      setMessage('⚠️ Cole o link do YouTube primeiro');
      return;
    }

    // Validar URL do YouTube
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    if (!youtubeRegex.test(url.trim())) {
      setMessage('⚠️ Link do YouTube inválido');
      return;
    }

    setStatus('downloading');
    setProgress(10);
    setMessage('⏳ Baixando áudio do YouTube...');

    try {
      const response = await fetch(`${API_URL}/api/youtube-download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          title: title.trim() || undefined,
          artist: artist.trim() || undefined
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao baixar música');
      }

      setProgress(100);
      setStatus('success');
      setMessage(`✅ "${data.title}" baixada com sucesso!`);
      
      if (onMusicDownloaded) {
        onMusicDownloaded(data);
      }

      // Limpar campos após sucesso
      setTimeout(() => {
        setUrl('');
        setTitle('');
        setArtist('');
        setStatus('idle');
        setMessage('');
        setProgress(0);
      }, 3000);

    } catch (error) {
      console.error('Erro no download:', error);
      setStatus('error');
      
      if (error.message === 'Failed to fetch' || error.message.includes('NetworkError') || error.message.includes('ERR_CONNECTION_REFUSED')) {
        setMessage(`❌ Servidor não está rodando! Execute: npm run dev:full`);
      } else {
        setMessage(`❌ Erro: ${error.message}`);
      }
      
      setProgress(0);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleDownload();
    }
  };

  return (
    <div className={`${getCardBackground()} backdrop-blur-[24px] -webkit-backdrop-blur-[24px] border-2 ${getBorderColor()} rounded-3xl p-5 shadow-2xl shadow-black/10`}>
      <h3 className={`text-lg font-semibold ${getTextColor()} mb-4 flex items-center gap-2`}>
        <span className="material-symbols-outlined text-white/60">download</span>
        Baixar Música do YouTube
      </h3>

      {/* Link do YouTube */}
      <div className="mb-3">
        <label className={`block text-sm font-medium ${getTextColor()}/80 mb-1`}>
          📎 Link do YouTube
        </label>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="https://youtube.com/watch?v=..."
          className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all"
          disabled={status === 'downloading'}
        />
      </div>

      {/* Título (opcional) */}
      <div className="mb-3">
        <label className={`block text-sm font-medium ${getTextColor()}/80 mb-1`}>
          🎵 Título <span className="text-white/40 text-xs">(opcional - se vazio, usa o do YouTube)</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nome da música"
          className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all"
          disabled={status === 'downloading'}
        />
      </div>

      {/* Artista (opcional) */}
      <div className="mb-4">
        <label className={`block text-sm font-medium ${getTextColor()}/80 mb-1`}>
          👤 Artista <span className="text-white/40 text-xs">(opcional)</span>
        </label>
        <input
          type="text"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
          placeholder="Nome do artista"
          className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all"
          disabled={status === 'downloading'}
        />
      </div>

      {/* Barra de Progresso */}
      {status !== 'idle' && (
        <div className="mb-3">
          <div className="w-full bg-white/20 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-2.5 rounded-full transition-all duration-500 ease-out ${
                status === 'error' ? 'bg-red-500' : 
                status === 'success' ? 'bg-green-500' : 'bg-white/40'
              }`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className={`text-xs mt-1 font-medium ${
            status === 'error' ? 'text-red-400' : 
            status === 'success' ? 'text-green-400' : `${getTextColor()}/60`
          }`}>
            {message}
          </p>
        </div>
      )}

      {/* Botão Download */}
      <button
        onClick={handleDownload}
        disabled={status === 'downloading'}
        className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
          status === 'downloading'
            ? 'bg-white/20 text-white/50 cursor-not-allowed'
            : 'bg-white/20 text-white hover:bg-white/30 active:scale-[0.98]'
        }`}
      >
        {status === 'downloading' ? (
          <>
            <span className="material-symbols-outlined animate-spin">progress_activity</span>
            Baixando...
          </>
        ) : (
          <>
            <span className="material-symbols-outlined">download</span>
            Baixar e Adicionar à Playlist
          </>
        )}
      </button>

      {/* Info */}
      <p className={`text-[10px] ${getTextColor()}/40 mt-3 text-center`}>
        🔒 Uso pessoal apenas. Respeite os direitos autorais.
      </p>
    </div>
  );
};

export default YoutubeDownloader;