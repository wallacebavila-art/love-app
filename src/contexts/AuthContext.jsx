import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { auth } from '../services/firebaseConfig';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext(null);

// Credenciais do administrador
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'wallace@para-raissa.firebaseapp.com';
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || '123456';

// Credenciais da Raíssa
const RAISSA_EMAIL = import.meta.env.VITE_RAISSA_EMAIL || 'raissa@para-raissa.firebaseapp.com';
const RAISSA_PASSWORD = import.meta.env.VITE_RAISSA_PASSWORD || 'wallaceteamo';

// Forçar valores corretos caso o env não funcione
const FORCED_ADMIN_EMAIL = 'wallace@para-raissa.firebaseapp.com';
const FORCED_RAISSA_EMAIL = 'raissa@para-raissa.firebaseapp.com';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Determinar tipo de usuário baseado no email
        const isAdmin = firebaseUser.email === FORCED_ADMIN_EMAIL;
        const isRaissa = firebaseUser.email === FORCED_RAISSA_EMAIL;

        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          isAdmin,
          isRaissa,
          userType: isAdmin ? 'admin' : (isRaissa ? 'raissa' : 'user')
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Determinar tipo de usuário baseado no email
      const isAdmin = firebaseUser.email === FORCED_ADMIN_EMAIL;
      const isRaissa = firebaseUser.email === FORCED_RAISSA_EMAIL;

      const userData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        isAdmin,
        isRaissa,
        userType: isAdmin ? 'admin' : (isRaissa ? 'raissa' : 'user')
      };

      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Erro no login:', error);
      throw new Error('Email ou senha inválidos');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Erro no logout:', error);
      throw error;
    }
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
