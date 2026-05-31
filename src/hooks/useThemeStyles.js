import { useTimePeriod } from '../contexts/TimePeriodContext';
import { useDarkMode } from '../contexts/DarkModeContext';

/**
 * Hook customizado para obter estilos baseados no período do dia
 * Elimina duplicação de código em múltiplos componentes
 */
export const useThemeStyles = () => {
  const { period } = useTimePeriod();
  const { isDarkMode, isExplicitMode } = useDarkMode();

  // Determinar se deve usar modo escuro
  const shouldUseDarkMode = isExplicitMode ? isDarkMode : period === 'night';

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

  const getTextColor = () => {
    return 'text-white';
  };

  const getAccentColor = () => {
    return 'text-white';
  };

  const getIconColor = () => {
    return 'text-white';
  };

  return {
    getCardBackground,
    getBorderColor,
    getTextColor,
    getAccentColor,
    getIconColor,
    isDarkMode: shouldUseDarkMode,
  };
};
