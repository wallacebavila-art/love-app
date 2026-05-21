import { useState } from 'react';
import { requestFCMToken } from '../services/fcmService';
import { getAllFCMTokens } from '../services/fcmTokenService';
import { fetchDailyMessage } from '../services/messageService';

const FCMTestButton = () => {
  const [token, setToken] = useState('');
  const [title, setTitle] = useState('Teste FCM');
  const [body, setBody] = useState('Mensagem de teste do Firebase Cloud Messaging');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [totalTokens, setTotalTokens] = useState(0);

  const handleGetToken = async () => {
    setLoading(true);
    const fcmToken = await requestFCMToken();
    setToken(fcmToken || 'Erro ao obter token');
    setLoading(false);
  };

  const handleGetTotalTokens = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/tokens');
      const data = await response.json();
      setTotalTokens(data.total);
      setResult(`📱 ${data.total} tokens encontrados`);
    } catch (error) {
      const tokens = await getAllFCMTokens();
      setTotalTokens(tokens.length);
      setResult(`📱 ${tokens.length} tokens encontrados (via Firestore)`);
    }
    setLoading(false);
  };

  const handleSendDirect = () => {
    // Envia notificação local (web notification)
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body: body,
        icon: '/love-app/icon-192.svg',
        badge: '/love-app/icon-192.svg',
      });
      setResult('✅ Notificação local enviada!');
    } else {
      setResult('❌ Permissão de notificação não concedida');
    }
  };

  const handleSendToAll = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/send-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, body }),
      });

      const data = await response.json();
      if (data.success) {
        setResult(`✅ Enviado para ${data.successCount}/${data.total} dispositivos`);
        if (data.failureCount > 0) {
          setResult(`✅ Enviado para ${data.successCount}/${data.total} dispositivos (${data.failureCount} falhas)`);
        }
      } else {
        setResult('❌ Erro ao enviar notificações');
      }
    } catch (error) {
      setResult('❌ Servidor backend não disponível. Use o script Node.js:');
      setResult('node send-notification-admin.js --all "Título" "Mensagem"');
    }
    setLoading(false);
  };

  const handleSendToActive = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/send-active', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, body }),
      });

      const data = await response.json();
      if (data.success) {
        setResult(`✅ Enviado para ${data.successCount}/${data.total} dispositivos ativos`);
      } else {
        setResult('❌ Erro ao enviar notificações');
      }
    } catch (error) {
      setResult('❌ Servidor backend não disponível');
    }
    setLoading(false);
  };

  const handleSendDailyMessage = async () => {
    setLoading(true);
    try {
      const message = await fetchDailyMessage();
      const response = await fetch('http://localhost:3001/api/send-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          title: 'Bom dia! 💕',
          body: message 
        }),
      });

      const data = await response.json();
      if (data.success) {
        setResult(`✅ Mensagem do dia enviada para ${data.successCount}/${data.total} dispositivos`);
      } else {
        setResult('❌ Erro ao enviar notificações');
      }
    } catch (error) {
      setResult('❌ Erro ao enviar mensagem do dia');
    }
    setLoading(false);
  };

  return (
    <div className="fixed top-4 left-4 z-50 bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-2xl max-w-sm">
      <h3 className="font-bold text-gray-800 mb-3">🧪 Teste FCM</h3>
      
      <div className="space-y-3">
        <button
          onClick={handleGetToken}
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
        >
          {loading ? 'Carregando...' : '🔑 Obter Token FCM'}
        </button>

        <button
          onClick={handleGetTotalTokens}
          disabled={loading}
          className="w-full px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50"
        >
          {loading ? 'Carregando...' : `📱 Total Tokens (${totalTokens})`}
        </button>

        {token && (
          <div className="bg-gray-100 rounded-lg p-2">
            <p className="text-xs text-gray-600 mb-1">Token:</p>
            <p className="text-xs text-gray-800 break-all">{token}</p>
          </div>
        )}

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />

        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Mensagem"
          rows="2"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
        />

        <button
          onClick={handleSendDirect}
          disabled={loading}
          className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
        >
          {loading ? 'Enviando...' : '📱 Notificação Local'}
        </button>

        <button
          onClick={handleSendToActive}
          disabled={loading}
          className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
        >
          {loading ? 'Enviando...' : '🔥 Enviar para Ativos'}
        </button>

        <button
          onClick={handleSendToAll}
          disabled={loading}
          className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
        >
          {loading ? 'Enviando...' : '🚀 Enviar para Todos'}
        </button>

        <button
          onClick={handleSendDailyMessage}
          disabled={loading}
          className="w-full px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50"
        >
          {loading ? 'Enviando...' : '💕 Enviar Mensagem do Dia'}
        </button>

        {result && (
          <p className="text-sm text-center mt-2 whitespace-pre-line">{result}</p>
        )}
      </div>
    </div>
  );
};

export default FCMTestButton;
