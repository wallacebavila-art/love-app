import { createContext, useContext, useState, useEffect, useRef } from 'react';

const AuthContext = createContext(null);

// Credenciais do administrador (hardcoded para simplificar)
// RECOMENDAÇÃO: Usar Firebase Authentication em produção
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'wallace';
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || '123456';

// Credenciais da Raíssa
const RAISSA_EMAIL = import.meta.env.VITE_RAISSA_EMAIL || 'raissa';
const RAISSA_PASSWORD = import.meta.env.VITE_RAISSA_PASSWORD || 'wallaceteamo';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    // Verificar se há usuário salvo no localStorage e se expirou
    const savedAdminUser = localStorage.getItem('adminUser');
    const savedRaissaUser = localStorage.getItem('raissaUser');
    const EXPIRATION_TIME = 10 * 60 * 1000; // 10 minutos

    const checkAndRestore = (data, key) => {
      const parsed = JSON.parse(data);
      if (Date.now() - parsed.lastActivity > EXPIRATION_TIME) {
        localStorage.removeItem(key);
        return null;
      }
      return parsed;
    };

    if (savedRaissaUser) {
      const userData = checkAndRestore(savedRaissaUser, 'raissaUser');
      if (userData) setUser(userData);
    } else if (savedAdminUser) {
      const userData = checkAndRestore(savedAdminUser, 'adminUser');
      if (userData) setUser(userData);
    }
    setLoading(false);
  }, []);

  // Heartbeat: atualiza o lastActivity a cada 5s enquanto o user estiver logado
  useEffect(() => {
    if (user) {
      intervalRef.current = setInterval(() => {
        const key = user.userType === 'admin' ? 'adminUser' : 'raissaUser';
        const savedData = localStorage.getItem(key);
        if (savedData) {
          const parsed = JSON.parse(savedData);
          parsed.lastActivity = Date.now();
          localStorage.setItem(key, JSON.stringify(parsed));
        }
      }, 5000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [user]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        const userData = { email, isAdmin: true, userType: 'admin', lastActivity: Date.now() };
        setUser(userData);
        localStorage.setItem('adminUser', JSON.stringify(userData));
        return userData;
      } else if (email === RAISSA_EMAIL && password === RAISSA_PASSWORD) {
        const userData = { email, isAdmin: false, userType: 'raissa', lastActivity: Date.now() };
        setUser(userData);
        localStorage.setItem('raissaUser', JSON.stringify(userData));
        return userData;
      } else {
        throw new Error('Email ou senha inválidos');
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (user?.userType === 'admin') {
      localStorage.removeItem('adminUser');
    } else if (user?.userType === 'raissa') {
      localStorage.removeItem('raissaUser');
    }
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
