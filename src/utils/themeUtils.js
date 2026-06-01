/**
 * Utilitários de tema para o aplicativo
 * 
 * Fornece funções para obter classes CSS baseadas no período do dia
 * e configurações de seleção de texto.
 */

/**
 * Obtém classes CSS baseadas no período do dia
 * 
 * @param {string} period - Período do dia ('morning', 'afternoon', 'night')
 * @returns {string} Classes CSS para o tema
 */
export const getThemeClasses = (period) => {
  switch (period) {
    case 'morning':
      return 'morning-theme text-white';
    case 'afternoon':
      return 'afternoon-theme text-white';
    case 'night':
      return 'night-theme text-white';
    default:
      return 'morning-theme text-white';
  }
};

/**
 * Obtém classes CSS para seleção de texto
 * 
 * @param {string} period - Período do dia ('morning', 'afternoon', 'night')
 * @returns {string} Classes CSS para seleção de texto
 */
export const getSelectionClasses = (period) => {
  switch (period) {
    case 'morning':
      return 'selection:bg-white/30 selection:text-white';
    case 'afternoon':
      return 'selection:bg-white/30 selection:text-white';
    case 'night':
      return 'selection:bg-white/30 selection:text-white';
    default:
      return 'selection:bg-white/30 selection:text-white';
  }
};
