import { RELATIONSHIP_START_DATE, MESSAGES_START_DATE, VERSES_START_DATE } from '../constants/appConfig';

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
 * O dia inicial conta como dia 1
 * @param {string} startDate - Data inicial no formato YYYY-MM-DD (padrão: usa RELATIONSHIP_START_DATE)
 * @returns {number} Número de dias desde a data inicial (dia inicial = dia 1)
 */
export const calculateDaysTogether = (startDate = RELATIONSHIP_START_DATE) => {
  // Parse da data inicial usando hora local
  const startParts = startDate.split('-');
  const start = new Date(
    parseInt(startParts[0]),
    parseInt(startParts[1]) - 1, // Mês é 0-indexed em JavaScript
    parseInt(startParts[2]),
    12, 0, 0, 0 // Meio-dia para evitar problemas de fuso horário
  );
  
  const now = new Date();
  now.setHours(12, 0, 0, 0); // Meio-dia para evitar problemas de fuso horário
  
  // Calcular diferença em milissegundos
  const diffTime = now.getTime() - start.getTime();
  
  // Converter para dias (arredondar para baixo)
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // Adicionar 1 para contar o dia inicial como dia 1
  return diffDays + 1;
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
 * Calcula a data da mensagem/versículo baseada na data de início
 * Se a data atual for antes da data de início, retorna null (não mostrar mensagem)
 * Se a data atual for depois da data de início, calcula a data correspondente
 * @param {string} startDate - Data de início no formato YYYY-MM-DD
 * @returns {string|null} Data no formato YYYY-MM-DD ou null se antes da data de início
 */
export const getMessageDateString = (startDate = MESSAGES_START_DATE) => {
  const now = new Date();
  const start = new Date(startDate);
  
  // Se a data atual for antes da data de início, retorna null
  if (now < start) {
    return null;
  }
  
  // Calcula a diferença em dias usando UTC para evitar problemas de fuso horário
  const diffTime = now.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // Retorna a data correspondente usando UTC
  const resultDate = new Date(start.getTime() + diffDays * 24 * 60 * 60 * 1000);
  
  const year = resultDate.getUTCFullYear();
  const month = String(resultDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(resultDate.getUTCDate()).padStart(2, '0');
  
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

/**
 * Formata a hora atual no formato HH:MM
 * @returns {string} Hora formatada (ex: "14:30")
 */
export const formatTime = (date = new Date()) => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

/**
 * Formata a data no formato brasileiro DD/MM/AAAA
 * @param {Date|string} date - Data para formatar
 * @returns {string} Data formatada (ex: "24/05/2024")
 */
export const formatDateBR = (date = new Date()) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Verifica se a data é hoje
 * @param {Date|string} date - Data para verificar
 * @returns {boolean} True se a data for hoje
 */
export const isToday = (date) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  return d.getDate() === today.getDate() &&
         d.getMonth() === today.getMonth() &&
         d.getFullYear() === today.getFullYear();
};

/**
 * Verifica se a data é fim de semana
 * @param {Date|string} date - Data para verificar
 * @returns {boolean} True se for sábado ou domingo
 */
export const isWeekend = (date = new Date()) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const day = d.getDay();
  return day === 0 || day === 6; // 0 = domingo, 6 = sábado
};

/**
 * Calcula a diferença em dias entre duas datas
 * @param {Date|string} date1 - Primeira data
 * @param {Date|string} date2 - Segunda data
 * @returns {number} Diferença em dias
 */
export const daysBetween = (date1, date2) => {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  const diffTime = d2.getTime() - d1.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Retorna uma descrição relativa do tempo (ex: "há 5 minutos", "há 2 horas")
 * @param {Date|string} date - Data para calcular
 * @returns {string} Descrição relativa do tempo
 */
export const getRelativeTime = (date) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'agora mesmo';
  if (diffMin < 60) return `há ${diffMin} minuto${diffMin > 1 ? 's' : ''}`;
  if (diffHour < 24) return `há ${diffHour} hora${diffHour > 1 ? 's' : ''}`;
  if (diffDay < 7) return `há ${diffDay} dia${diffDay > 1 ? 's' : ''}`;
  if (diffDay < 30) return `há ${Math.floor(diffDay / 7)} semana${Math.floor(diffDay / 7) > 1 ? 's' : ''}`;
  if (diffDay < 365) return `há ${Math.floor(diffDay / 30)} mês${Math.floor(diffDay / 30) > 1 ? 'es' : ''}`;
  return `há ${Math.floor(diffDay / 365)} ano${Math.floor(diffDay / 365) > 1 ? 's' : ''}`;
};

/**
 * Adiciona dias a uma data
 * @param {Date|string} date - Data base
 * @param {number} days - Número de dias a adicionar
 * @returns {Date} Nova data
 */
export const addDays = (date, days) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const result = new Date(d);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Subtrai dias de uma data
 * @param {Date|string} date - Data base
 * @param {number} days - Número de dias a subtrair
 * @returns {Date} Nova data
 */
export const subtractDays = (date, days) => {
  return addDays(date, -days);
};

/**
 * Retorna o nome do mês em português
 * @param {number} month - Número do mês (0-11)
 * @returns {string} Nome do mês
 */
export const getMonthName = (month) => {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return months[month];
};

/**
 * Retorna o nome do dia da semana em português
 * @param {number} day - Número do dia (0-6, onde 0 = domingo)
 * @returns {string} Nome do dia
 */
export const getDayName = (day) => {
  const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  return days[day];
};
