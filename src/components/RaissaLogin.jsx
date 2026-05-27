import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const RaissaLogin = ({ onClose, isModal = false }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [useLoveName, setUseLoveName] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Carregar preferência do localStorage
    const saved = localStorage.getItem('useLoveName');
    if (saved) {
      setUseLoveName(JSON.parse(saved));
    }

    // Ouvir evento de toggle
    const handleToggle = (e) => {
      setUseLoveName(e.detail);
    };

    window.addEventListener('loveNameToggled', handleToggle);
    return () => window.removeEventListener('loveNameToggled', handleToggle);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(username, password);
      if (isModal && onClose) {
        onClose();
      } else {
        navigate('/');
      }
    } catch (error) {
      setError('Usuário ou senha inválidos');
      console.error('Erro ao fazer login:', error);
    }
  };

  return (
    <div className={isModal ? "" : "min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100/50 via-pink-100/50 to-purple-100/50 px-4 backdrop-blur-sm"}>
      <div className="max-w-md w-full">
        <div className="bg-white/80 backdrop-blur-[20px] -webkit-backdrop-blur-[20px] border border-white/50 rounded-3xl p-8 shadow-xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[32px]">login</span>
            </div>
            <h1 className="font-headline-lg text-[24px] text-gray-800 font-bold mb-2">Login</h1>
            <p className="text-gray-600 text-[14px]">{useLoveName ? 'Amor' : 'Raíssa'}, faça o login para acessar as funcionalidades do seu site</p>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Usuário
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-purple-300 focus:border-purple-300 focus:bg-white/70 outline-none transition backdrop-blur-sm"
                placeholder="Seu usuário"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-purple-300 focus:border-purple-300 focus:bg-white/70 outline-none transition backdrop-blur-sm"
                placeholder="••••••••"
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-600 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Entrar
            </button>
          </form>
          
          {!isModal && (
            <div className="mt-6 text-center">
              <button
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors"
              >
                ← Voltar para a página inicial
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RaissaLogin;
