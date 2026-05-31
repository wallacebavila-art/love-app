import express from 'express';
import cors from 'cors';
import admin from 'firebase-admin';
import { readFileSync, writeFileSync, existsSync, mkdirSync, unlinkSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

try {
  const serviceAccountPath = join(__dirname, 'service-account-key.json');
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'para-raissa.firebasestorage.app'
  });
  console.log('Firebase Admin SDK inicializado com sucesso');
} catch (error) {
  console.error('Erro ao inicializar Firebase Admin SDK:', error.message);
  process.exit(1);
}

const getAllTokens = async () => {
  try {
    const db = admin.firestore();
    const snapshot = await db.collection('fcm_tokens').get();
    const tokens = [];
    snapshot.forEach((doc) => {
      tokens.push({ token: doc.data().token, lastUsed: doc.data().lastUsed, createdAt: doc.data().createdAt });
    });
    return tokens;
  } catch (error) {
    console.error('Erro ao buscar tokens:', error);
    return [];
  }
};

const updateTokenLastUsed = async (token) => {
  try {
    const db = admin.firestore();
    await db.collection('fcm_tokens').doc(token).update({ lastUsed: new Date().toISOString() });
  } catch (error) {
    console.error('Erro ao atualizar ultimo uso:', error);
  }
};

app.post('/api/heartbeat', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Token nao fornecido' });
    await updateTokenLastUsed(token);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erro no heartbeat' });
  }
});

app.post('/api/send-all', async (req, res) => {
  try {
    const { title, body } = req.body;
    if (!title || !body) return res.status(400).json({ error: 'Titulo e corpo sao obrigatorios' });
    const tokens = await getAllTokens();
    if (tokens.length === 0) return res.status(404).json({ error: 'Nenhum token encontrado' });
    const message = {
      notification: { title, body },
      webpush: { notification: { icon: '/love-app/icon-192.svg', badge: '/love-app/icon-192.svg' }, fcm_options: { link: 'https://wallacebavila-art.github.io/love-app/' } },
    };
    let successCount = 0, failureCount = 0, failedTokens = [];
    for (const t of tokens) {
      try { await admin.messaging().send({ ...message, token: t.token }); successCount++; }
      catch (e) { failureCount++; failedTokens.push(t.token.substring(0, 20) + '...'); }
    }
    res.json({ success: true, total: tokens.length, successCount, failureCount, failedTokens });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao enviar notificacoes' });
  }
});

app.post('/api/send-active', async (req, res) => {
  try {
    const { title, body } = req.body;
    if (!title || !body) return res.status(400).json({ error: 'Titulo e corpo sao obrigatorios' });
    const tokens = await getAllTokens();
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const activeTokens = tokens.filter(t => t.lastUsed && t.lastUsed > fiveMinutesAgo);
    if (activeTokens.length === 0) return res.status(404).json({ error: 'Nenhum token ativo encontrado' });
    const message = { notification: { title, body }, data: { title, body, timestamp: Date.now().toString() }, webpush: { notification: { icon: '/love-app/icon-192.svg', badge: '/love-app/icon-192.svg' }, fcm_options: { link: 'https://wallacebavila-art.github.io/love-app/' } } };
    let successCount = 0, failureCount = 0;
    for (const t of activeTokens) {
      try { await admin.messaging().send({ ...message, token: t.token }); successCount++; }
      catch (e) { failureCount++; }
    }
    res.json({ success: true, total: activeTokens.length, successCount, failureCount });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao enviar notificacoes' });
  }
});

app.get('/api/tokens', async (req, res) => {
  try {
    const tokens = await getAllTokens();
    res.json({ total: tokens.length, tokens: tokens.map(t => ({ id: t.id, token: t.token.substring(0, 20) + '...', lastUsed: t.lastUsed, createdAt: t.createdAt })) });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar tokens' });
  }
});

app.delete('/api/tokens/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = admin.firestore();
    const snapshot = await db.collection('fcm_tokens').where('id', '==', id).get();
    if (snapshot.empty) return res.status(404).json({ error: 'Token nao encontrado' });
    await snapshot.docs[0].ref.delete();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar token' });
  }
});

app.delete('/api/tokens', async (req, res) => {
  try {
    const db = admin.firestore();
    const snapshot = await db.collection('fcm_tokens').get();
    const batch = db.batch();
    let deletedCount = 0;
    snapshot.docs.forEach(doc => { batch.delete(doc.ref); deletedCount++; });
    await batch.commit();
    res.json({ success: true, deletedCount });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar todos os tokens' });
  }
});

const MUSIC_DIR = join(__dirname, 'public', 'music');
const PLAYLIST_PATH = join(__dirname, 'src', 'data', 'playlist.js');

if (!existsSync(MUSIC_DIR)) {
  mkdirSync(MUSIC_DIR, { recursive: true });
}

const YTDLP_PATH = join(__dirname, 'public', 'yt-dlp.exe');

app.post('/api/youtube-download', async (req, res) => {
  try {
    const { url, title: customTitle, artist: customArtist } = req.body;

    if (!url) return res.status(400).json({ error: 'URL do YouTube e obrigatoria' });

    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    if (!youtubeRegex.test(url.trim())) return res.status(400).json({ error: 'URL do YouTube invalida' });

    if (!existsSync(YTDLP_PATH)) {
      return res.status(500).json({ error: 'yt-dlp nao encontrado' });
    }

    console.log('Obtendo informacoes do video...');
    let videoTitle = 'Musica';
    let videoAuthor = 'Desconhecido';

    try {
      const { stdout } = await execFileAsync(YTDLP_PATH, ['--dump-json', '--no-playlist', url.trim()], { timeout: 30000 });
      const data = JSON.parse(stdout);
      videoTitle = data.title || 'Musica';
      videoAuthor = data.artist || data.uploader || 'Desconhecido';
      console.log('Video:', videoTitle, '-', videoAuthor);
    } catch (e) {
      console.log('Nao foi possivel obter info, usando dados padrao');
    }

    const removeAccents = (str) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const cleanTitle = removeAccents(customTitle || videoTitle)
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
      .substring(0, 50);

    const fileName = cleanTitle + '_' + Date.now() + '.m4a';
    const outputPath = join(MUSIC_DIR, fileName);

    console.log('Baixando:', customTitle || videoTitle);

    await execFileAsync(YTDLP_PATH, [
      '-f', 'ba[ext=m4a]',
      '--output', outputPath,
      '--no-playlist',
      '--no-warnings',
      url.trim()
    ], { timeout: 300000, maxBuffer: 50 * 1024 * 1024 });

    console.log('Download concluido:', fileName);

    // Upload para Firebase Storage
    const trackTitle = customTitle || videoTitle;
    const trackArtist = customArtist || videoAuthor;

    console.log('Fazendo upload para Firebase Storage...');
    const bucket = admin.storage().bucket();
    const destinationPath = 'music/' + fileName;

    await bucket.upload(outputPath, {
      destination: destinationPath,
      metadata: { contentType: 'audio/mp4', cacheControl: 'public, max-age=31536000' },
    });

    // Gerar URL de download usando getDownloadURL (acesso autenticado)
    const [firebaseUrl] = await bucket.file(destinationPath).getSignedUrl({
      action: 'read',
      expires: '2030-01-01'
    });
    console.log('Upload concluido:', firebaseUrl);

    // Deletar arquivo local após upload bem-sucedido
    try {
      unlinkSync(outputPath);
      console.log('Arquivo local deletado:', fileName);
    } catch (error) {
      console.warn('Aviso: nao foi possivel deletar arquivo local:', error.message);
    }

    const db = admin.firestore();
    await db.collection('music_playlist').add({
      title: trackTitle,
      artist: trackArtist,
      url: firebaseUrl,
      fileName: fileName,
      createdAt: new Date().toISOString()
    });

    // Atualizar playlist.js com URL do Firebase
    let playlistContent = '';
    try {
      playlistContent = readFileSync(PLAYLIST_PATH, 'utf-8');
    } catch (e) {
      playlistContent = 'export const playlist = [\n];\n';
    }

    const lastIdMatch = playlistContent.match(/id:\s*(\d+)/g);
    let newId = 1;
    if (lastIdMatch && lastIdMatch.length > 0) {
      const lastId = parseInt(lastIdMatch[lastIdMatch.length - 1].replace('id:', '').trim());
      newId = lastId + 1;
    }

    const escapedTitle = trackTitle.replace(/"/g, '\\"');
    const escapedArtist = trackArtist.replace(/"/g, '\\"');
    const newEntry = '  {\n    id: ' + newId + ',\n    title: "' + escapedTitle + '",\n    artist: "' + escapedArtist + '",\n    src: "' + firebaseUrl + '"\n  },\n';

    if (playlistContent.includes('];')) {
      playlistContent = playlistContent.replace('];', newEntry + '];');
    } else {
      playlistContent = 'export const playlist = [\n' + newEntry + '];\n';
    }

    writeFileSync(PLAYLIST_PATH, playlistContent, 'utf-8');
    console.log('Playlist atualizada:', trackTitle);

    res.json({
      success: true,
      title: trackTitle,
      artist: trackArtist,
      fileName: fileName,
      path: firebaseUrl,
      message: trackTitle + ' baixada e disponivel na nuvem!'
    });

  } catch (error) {
    console.error('Erro ao baixar musica:', error);
    res.status(500).json({ error: 'Erro ao baixar musica: ' + error.message });
  }
});

app.listen(PORT, () => {
  console.log('Servidor rodando na porta', PORT);
});