import express from 'express';
import cors from 'cors';
import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Inicializar Firebase Admin SDK
try {
  const serviceAccountPath = join(__dirname, 'service-account-key.json');
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('✅ Firebase Admin SDK inicializado com sucesso');
} catch (error) {
  console.error('❌ Erro ao inicializar Firebase Admin SDK:', error.message);
  process.exit(1);
}

// Buscar todos os tokens do Firestore
const getAllTokens = async () => {
  try {
    const db = admin.firestore();
    const snapshot = await db.collection('fcm_tokens').get();
    
    const tokens = [];
    snapshot.forEach((doc) => {
      tokens.push({
        token: doc.data().token,
        lastUsed: doc.data().lastUsed,
        createdAt: doc.data().createdAt
      });
    });
    
    return tokens;
  } catch (error) {
    console.error('❌ Erro ao buscar tokens:', error);
    return [];
  }
};

// Atualizar timestamp de último uso
const updateTokenLastUsed = async (token) => {
  try {
    const db = admin.firestore();
    const tokenRef = db.collection('fcm_tokens').doc(token);
    await tokenRef.update({
      lastUsed: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar último uso:', error);
  }
};

// Endpoint para heartbeat (manter token ativo)
app.post('/api/heartbeat', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Token não fornecido' });
    }
    
    await updateTokenLastUsed(token);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Erro no heartbeat:', error);
    res.status(500).json({ error: 'Erro no heartbeat' });
  }
});

// Endpoint para enviar notificação para todos
app.post('/api/send-all', async (req, res) => {
  try {
    const { title, body } = req.body;
    
    if (!title || !body) {
      return res.status(400).json({ error: 'Título e corpo são obrigatórios' });
    }
    
    const tokens = await getAllTokens();
    
    if (tokens.length === 0) {
      return res.status(404).json({ error: 'Nenhum token encontrado' });
    }
    
    const message = {
      notification: {
        title: title,
        body: body,
      },
      webpush: {
        notification: {
          icon: '/love-app/icon-192.svg',
          badge: '/love-app/icon-192.svg',
        },
        fcm_options: {
          link: 'https://wallacebavila-art.github.io/love-app/',
        },
      },
    };

    let successCount = 0;
    let failureCount = 0;
    const failedTokens = [];

    for (const tokenData of tokens) {
      try {
        await admin.messaging().send({ ...message, token: tokenData.token });
        successCount++;
      } catch (error) {
        failureCount++;
        failedTokens.push(tokenData.token.substring(0, 20) + '...');
        console.error(`❌ Erro ao enviar para token ${tokenData.token.substring(0, 20)}...:`, error.message);
      }
    }

    res.json({
      success: true,
      total: tokens.length,
      successCount,
      failureCount,
      failedTokens
    });
  } catch (error) {
    console.error('❌ Erro ao enviar notificações:', error);
    res.status(500).json({ error: 'Erro ao enviar notificações' });
  }
});

// Endpoint para enviar notificação para tokens ativos (última atividade < 5 minutos)
app.post('/api/send-active', async (req, res) => {
  try {
    const { title, body } = req.body;
    
    if (!title || !body) {
      return res.status(400).json({ error: 'Título e corpo são obrigatórios' });
    }
    
    const tokens = await getAllTokens();
    
    // Filtrar tokens ativos (última atividade < 5 minutos)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const activeTokens = tokens.filter(t => t.lastUsed && t.lastUsed > fiveMinutesAgo);
    
    if (activeTokens.length === 0) {
      return res.status(404).json({ error: 'Nenhum token ativo encontrado' });
    }
    
    const message = {
      notification: {
        title: title,
        body: body,
      },
      data: {
        title: title,
        body: body,
        timestamp: Date.now().toString()
      },
      webpush: {
        notification: {
          icon: '/love-app/icon-192.svg',
          badge: '/love-app/icon-192.svg',
        },
        fcm_options: {
          link: 'https://wallacebavila-art.github.io/love-app/',
        },
      },
    };

    let successCount = 0;
    let failureCount = 0;

    for (const tokenData of activeTokens) {
      try {
        await admin.messaging().send({ ...message, token: tokenData.token });
        successCount++;
      } catch (error) {
        failureCount++;
        console.error(`❌ Erro ao enviar para token ${tokenData.token.substring(0, 20)}...:`, error.message);
      }
    }

    res.json({
      success: true,
      total: activeTokens.length,
      successCount,
      failureCount
    });
  } catch (error) {
    console.error('❌ Erro ao enviar notificações:', error);
    res.status(500).json({ error: 'Erro ao enviar notificações' });
  }
});

// Endpoint para listar todos os tokens
app.get('/api/tokens', async (req, res) => {
  try {
    const tokens = await getAllTokens();
    res.json({
      total: tokens.length,
      tokens: tokens.map(t => ({
        id: t.id,
        token: t.token.substring(0, 20) + '...',
        lastUsed: t.lastUsed,
        createdAt: t.createdAt
      }))
    });
  } catch (error) {
    console.error('❌ Erro ao buscar tokens:', error);
    res.status(500).json({ error: 'Erro ao buscar tokens' });
  }
});

// Endpoint para deletar um token específico
app.delete('/api/tokens/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = admin.firestore();
    const tokensRef = db.collection('fcm_tokens');
    const snapshot = await tokensRef.where('id', '==', id).get();

    if (snapshot.empty) {
      return res.status(404).json({ error: 'Token não encontrado' });
    }

    const doc = snapshot.docs[0];
    await doc.ref.delete();

    res.json({ success: true });
  } catch (error) {
    console.error('❌ Erro ao deletar token:', error);
    res.status(500).json({ error: 'Erro ao deletar token' });
  }
});

// Endpoint para deletar todos os tokens
app.delete('/api/tokens', async (req, res) => {
  try {
    const db = admin.firestore();
    const tokensRef = db.collection('fcm_tokens');
    const snapshot = await tokensRef.get();

    let deletedCount = 0;
    const batch = db.batch();

    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
      deletedCount++;
    });

    await batch.commit();

    res.json({ success: true, deletedCount });
  } catch (error) {
    console.error('❌ Erro ao deletar todos os tokens:', error);
    res.status(500).json({ error: 'Erro ao deletar todos os tokens' });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📡 API disponível em http://localhost:${PORT}`);
});
