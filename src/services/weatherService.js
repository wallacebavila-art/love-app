// API Key gratuita do OpenWeatherMap (limitada)
const API_KEY = import.meta.env.VITE_OPENWEATHERMAP_API_KEY || '4d8fb5b93d4af21d66a2948710284366';
const CITY = 'Rio de Janeiro';
const CACHE_KEY = 'weather-cache';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutos

/**
 * Lê o cache do clima do sessionStorage
 * @returns {Object|null} Dados do clima em cache ou null se expirado/inválido
 */
const readWeatherCache = () => {
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    const now = Date.now();

    // Verifica se o cache expirou
    if (now - timestamp > CACHE_TTL_MS) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }

    return data;
  } catch {
    return null;
  }
};

/**
 * Escreve os dados do clima no cache
 * @param {Object} data - Dados do clima para cache
 */
const writeWeatherCache = (data) => {
  try {
    const cacheData = {
      data,
      timestamp: Date.now()
    };
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Erro ao escrever cache do clima:', error);
  }
};

/**
 * Busca o clima atual do Rio de Janeiro
 * @returns {Promise<Object|null>} Dados do clima ou null em caso de erro
 */
export const fetchWeather = async () => {
  // Verifica cache primeiro
  const cached = readWeatherCache();
  if (cached) {
    console.log('Usando cache do clima');
    return cached;
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${API_KEY}&units=metric&lang=pt_br`
    );
    
    if (!response.ok) {
      throw new Error('Erro ao buscar clima');
    }
    
    const data = await response.json();
    
    const weatherData = {
      temp: Math.round(data.main.temp),
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      humidity: data.main.humidity,
      feelsLike: Math.round(data.main.feels_like)
    };

    // Salva no cache
    writeWeatherCache(weatherData);

    return weatherData;
  } catch (error) {
    console.error('Erro ao buscar clima:', error);
    return null;
  }
};
