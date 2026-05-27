import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Credenciais do administrador (hardcoded para simplificar)
const ADMIN_EMAIL = 'wallace';
const ADMIN_PASSWORD = '123456';

// Credenciais da Raíssa
const RAISSA_EMAIL = 'raissa';
const RAISSA_PASSWORD = 'wallaceteamo';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Verificar se há usuário salvo no localStorage (admin ou raissa)
    const savedAdminUser = localStorage.getItem('adminUser');
    const savedRaissaUser = localStorage.getItem('raissaUser');

    if (savedRaissaUser) {
      setUser(JSON.parse(savedRaissaUser));
    } else if (savedAdminUser) {
      setUser(JSON.parse(savedAdminUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        const userData = { email, isAdmin: true, userType: 'admin' };
        setUser(userData);
        localStorage.setItem('adminUser', JSON.stringify(userData));
        return userData;
      } else if (email === RAISSA_EMAIL && password === RAISSA_PASSWORD) {
        const userData = { email, isAdmin: false, userType: 'raissa' };
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
