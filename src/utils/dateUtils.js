/**
 * Formata a data atual em português
 * @returns {string} Data formatada (ex: "Segunda-feira, 24 de Maio de 2024")
 */
export const formatDateInPortuguese = () => {
  const now = new Date();
  const options = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  
  return now.toLocaleDateString('pt-BR', options);
};

/**
 * Calcula a diferença de dias entre hoje e uma data inicial
 * @param {string} startDate - Data inicial no formato YYYY-MM-DD (padrão: "2026-01-12")
 * @returns {number} Número de dias desde a data inicial
 */
export const calculateDaysTogether = (startDate = "2026-01-12") => {
  const start = new Date(startDate);
  const now = new Date();
  
  // Resetar as horas para meia-noite para cálculo preciso
  start.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  
  const diffTime = Math.abs(now - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/**
 * Retorna a data de hoje no formato AAAA-MM-DD para uso no Firebase
 * @returns {string} Data no formato YYYY-MM-DD
 */
export const getTodayDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Retorna o período do dia baseado no horário atual
 * @returns {string} 'morning', 'afternoon' ou 'night'
 */
export const getDayPeriod = () => {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    return 'morning';
  } else if (hour >= 12 && hour < 18) {
    return 'afternoon';
  } else {
    return 'night';
  }
};

/**
 * Retorna a saudação baseada no período do dia
 * @returns {string} 'Bom dia', 'Boa tarde' ou 'Boa noite'
 */
export const getGreeting = () => {
  const period = getDayPeriod();
  
  switch (period) {
    case 'morning':
      return 'Bom dia';
    case 'afternoon':
      return 'Boa tarde';
    case 'night':
      return 'Boa noite';
    default:
      return 'Bom dia';
  }
};
