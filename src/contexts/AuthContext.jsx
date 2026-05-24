import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Credenciais do administrador (hardcoded para simplificar)
const ADMIN_EMAIL = 'admin@love-app.com';
const ADMIN_PASSWORD = 'admin123';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Verificar se há usuário salvo no localStorage
    const savedUser = localStorage.getItem('adminUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        const userData = { email, isAdmin: true };
        setUser(userData);
        localStorage.setItem('adminUser', JSON.stringify(userData));
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
    setUser(null);
    localStorage.removeItem('adminUser');
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
