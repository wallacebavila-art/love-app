import { createContext, useContext, useMemo } from 'react';
import { useTimePeriod } from './TimePeriodContext';
import { useDarkMode } from './DarkModeContext';

const ThemeContext = createContext(null);

/**
 * Provider de tema que calcula estilos uma vez e os disponibiliza via contexto
 * Evita re-cálculos em cada componente
 */
export const ThemeProvider = ({ children }) => {
  const { period } = useTimePeriod();
  const { isDarkMode, isExplicitMode } = useDarkMode();

  // Determinar se deve usar modo escuro
  const shouldUseDarkMode = isExplicitMode ? isDarkMode : period === 'night';

  // Calcular estilos uma vez usando useMemo
  const themeStyles = useMemo(() => {
    const getCardBackground = () => {
      if (shouldUseDarkMode) {
        return 'bg-black/60';
      }
      switch (period) {
        case 'morning':
          return 'bg-black/40';
        case 'afternoon':
          return 'bg-black/40';
        case 'night':
          return 'bg-black/50';
        default:
          return 'bg-black/40';
      }
    };

    const getBorderColor = () => {
      if (shouldUseDarkMode) {
        return 'border-white/15';
      }
      switch (period) {
        case 'morning':
          return 'border-white/35';
        case 'afternoon':
          return 'border-white/35';
        case 'night':
          return 'border-white/25';
        default:
          return 'border-white/35';
      }
    };

    const getTextColor = () => 'text-white';
    const getAccentColor = () => 'text-white';
    const getIconColor = () => 'text-white';

    return {
      getCardBackground,
      getBorderColor,
      getTextColor,
      getAccentColor,
      getIconColor,
      isDarkMode: shouldUseDarkMode,
      period,
    };
  }, [shouldUseDarkMode, period]);

  return (
    <ThemeContext.Provider value={themeStyles}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

// Hook compatível para migração gradual
export const useThemeStyles = () => {
  return useTheme();
};
