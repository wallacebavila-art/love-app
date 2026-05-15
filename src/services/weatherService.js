// API Key gratuita do OpenWeatherMap (limitada)
const API_KEY = '4d8fb5b93d4af21d66a2948710284366';
const CITY = 'Rio de Janeiro';

/**
 * Busca o clima atual do Rio de Janeiro
 * @returns {Promise<Object|null>} Dados do clima ou null em caso de erro
 */
export const fetchWeather = async () => {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${API_KEY}&units=metric&lang=pt_br`
    );
    
    if (!response.ok) {
      throw new Error('Erro ao buscar clima');
    }
    
    const data = await response.json();
    
    return {
      temp: Math.round(data.main.temp),
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      humidity: data.main.humidity,
      feelsLike: Math.round(data.main.feels_like)
    };
  } catch (error) {
    console.error('Erro ao buscar clima:', error);
    return null;
  }
};
