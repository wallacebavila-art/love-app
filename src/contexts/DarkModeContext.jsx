import { createContext, useContext, useState, useEffect } from 'react';

const DarkModeContext = createContext(null);

export const DarkModeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isExplicitMode, setIsExplicitMode] = useState(false);

  useEffect(() => {
    // Carregar preferência do localStorage
    const savedDarkMode = localStorage.getItem('darkMode');
    const savedExplicitMode = localStorage.getItem('explicitDarkMode');
    
    if (savedExplicitMode === 'true') {
      setIsExplicitMode(true);
      setIsDarkMode(savedDarkMode === 'true');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    try {
      localStorage.setItem('darkMode', newMode.toString());
    } catch (error) {
      console.error('Erro ao salvar darkMode no localStorage:', error);
    }
  };

  const enableExplicitMode = () => {
    setIsExplicitMode(true);
    try {
      localStorage.setItem('explicitDarkMode', 'true');
    } catch (error) {
      console.error('Erro ao salvar explicitDarkMode no localStorage:', error);
    }
  };

  const disableExplicitMode = () => {
    setIsExplicitMode(false);
    localStorage.removeItem('explicitDarkMode');
    localStorage.removeItem('darkMode');
    setIsDarkMode(false);
  };

  return (
    <DarkModeContext.Provider
      value={{
        isDarkMode,
        isExplicitMode,
        toggleDarkMode,
        enableExplicitMode,
        disableExplicitMode
      }}
    >
      {children}
    </DarkModeContext.Provider>
  );
};

export const useDarkMode = () => {
  const context = useContext(DarkModeContext);
  if (!context) {
    throw new Error('useDarkMode must be used within DarkModeProvider');
  }
  return context;
};
