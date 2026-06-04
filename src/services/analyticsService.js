import { PLAUSIBLE_DOMAIN, PLAUSIBLE_URL, ANALYTICS_ENABLED } from '../constants/appConfig';
import { logger } from '../utils/logger';

/**
 * Serviço de Analytics
 * Suporta Plausible para analytics de uso
 * Sentry desabilitado devido a problemas com dependências
 */

let plausibleInitialized = false;

/**
 * Inicializa Sentry para tracking de erros
 * DESABILITADO: Problemas com dependências @sentry/react e @sentry/browser
 */
export const initSentry = async () => {
  logger.warn('Sentry initialization disabled due to dependency issues');
  return;
};

/**
 * Inicializa Plausible para analytics de uso
 */
export const initPlausible = () => {
  if (!ANALYTICS_ENABLED || !PLAUSIBLE_DOMAIN || plausibleInitialized) {
    return;
  }

  try {
    const script = document.createElement('script');
    script.defer = true;
    script.dataset.domain = PLAUSIBLE_DOMAIN;
    script.src = `${PLAUSIBLE_URL}/js/script.js`;
    document.head.appendChild(script);

    plausibleInitialized = true;
    logger.log('✅ Plausible inicializado');
  } catch (error) {
    logger.error('❌ Erro ao inicializar Plausible:', error);
  }
};

/**
 * Inicializa todos os serviços de analytics
 */
export const initAnalytics = async () => {
  await initSentry();
  initPlausible();
};

/**
 * Rastreia um evento de página
 * @param {string} pageName - Nome da página
 * @param {Object} props - Propriedades adicionais
 */
export const trackPageView = (pageName, props = {}) => {
  if (!ANALYTICS_ENABLED || !plausibleInitialized) {
    return;
  }

  try {
    window.plausible('pageview', {
      u: window.location.href,
      props: { page: pageName, ...props },
    });
  } catch (error) {
    logger.error('❌ Erro ao rastrear page view:', error);
  }
};

/**
 * Rastreia um evento personalizado
 * @param {string} eventName - Nome do evento
 * @param {Object} props - Propriedades do evento
 */
export const trackEvent = (eventName, props = {}) => {
  if (!ANALYTICS_ENABLED || !plausibleInitialized) {
    return;
  }

  try {
    window.plausible(eventName, { props });
  } catch (error) {
    logger.error('❌ Erro ao rastrear evento:', error);
  }
};

/**
 * Captura um erro no Sentry
 * DESABILITADO: Problemas com dependências @sentry/react e @sentry/browser
 * @param {Error} error - Erro a ser capturado
 * @param {Object} context - Contexto adicional
 */
export const captureError = async (error, context = {}) => {
  logger.error('Erro:', error);
  return;
};

/**
 * Captura uma mensagem no Sentry
 * DESABILITADO: Problemas com dependências @sentry/react e @sentry/browser
 * @param {string} message - Mensagem a ser capturada
 * @param {string} level - Nível de severidade (info, warning, error)
 */
export const captureMessage = async (message, level = 'info') => {
  logger.log(`[${level}] ${message}`);
  return;
};
