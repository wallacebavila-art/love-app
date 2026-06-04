import { GOOGLE_MAPS_API_KEY } from '../constants/appConfig';

const GOOGLE_MAPS_URL = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;

let isLoaded = false;
let loadPromise = null;
let hasFailed = false;

/**
 * Carrega o script do Google Maps dinamicamente (lazy loading)
 * @returns {Promise<void>} Promise que resolve quando o script estiver carregado
 */
export const loadGoogleMaps = () => {
  // Se já falhou anteriormente, retorna erro imediatamente
  if (hasFailed) {
    return Promise.reject(new Error('Google Maps falhou anteriormente'));
  }

  // Se já estiver carregado, retorna o promise existente
  if (isLoaded) {
    return Promise.resolve();
  }

  // Se já estiver carregando, retorna o promise existente
  if (loadPromise) {
    return loadPromise;
  }

  // Se já estiver disponível no window, marca como carregado
  if (window.google && window.google.maps) {
    isLoaded = true;
    return Promise.resolve();
  }

  // Cria o promise de carregamento
  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = GOOGLE_MAPS_URL;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      isLoaded = true;
      resolve();
    };

    script.onerror = () => {
      loadPromise = null;
      hasFailed = true;
      reject(new Error('Falha ao carregar o Google Maps'));
    };

    document.head.appendChild(script);
  });

  return loadPromise;
};

/**
 * Verifica se o Google Maps já está carregado
 * @returns {boolean} True se o Google Maps estiver disponível
 */
export const isGoogleMapsLoaded = () => {
  return isLoaded || (window.google && window.google.maps);
};

/**
 * Verifica se o Google Maps falhou
 * @returns {boolean} True se o Google Maps falhou
 */
export const hasGoogleMapsFailed = () => {
  return hasFailed;
};
