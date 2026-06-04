/**
 * Validação de Environment Variables
 * Garante que todas as variáveis de ambiente necessárias estão definidas
 */

const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_FIREBASE_DATABASE_URL',
  'VITE_FCM_VAPID_KEY',
  'VITE_GOOGLE_MAPS_API_KEY',
  'VITE_YOUTUBE_API_KEY',
  'VITE_OPENWEATHERMAP_API_KEY'
];

const optionalEnvVars = [
  'VITE_ADMIN_EMAILS',
  'VITE_RAISSA_EMAILS',
  'VITE_YOUTUBE_PLAYLIST_ID',
  'VITE_ICLOUD_CALENDAR_URL',
  'VITE_CORS_PROXY_URL',
  'VITE_RELATIONSHIP_START_DATE',
  'VITE_WEATHER_CITY'
];

/**
 * Valida se todas as variáveis de ambiente obrigatórias estão definidas
 * @throws {Error} Se alguma variável obrigatória estiver faltando
 */
export const validateEnvVars = () => {
  const missingVars = [];

  requiredEnvVars.forEach(varName => {
    if (!import.meta.env[varName]) {
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missingVars.join('\n')}\n\n` +
      `Please add these variables to your .env file or environment configuration.`
    );
  }

  console.log('✅ All required environment variables are validated');
};

/**
 * Valida variáveis de ambiente em modo desenvolvimento
 * Em produção, lança erro se faltar variáveis obrigatórias
 */
export const validateEnv = () => {
  if (import.meta.env.DEV) {
    // Em desenvolvimento, apenas avisa sobre variáveis faltantes
    const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);
    if (missingVars.length > 0) {
      console.warn(
        `⚠️ Missing environment variables (development):\n${missingVars.join('\n')}\n` +
        `The app may not work correctly without these variables.`
      );
    }
  } else {
    // Em produção, lança erro se faltar variáveis obrigatórias
    validateEnvVars();
  }
};

/**
 * Retorna todas as variáveis de ambiente configuradas
 */
export const getEnvConfig = () => {
  return {
    required: requiredEnvVars.reduce((acc, varName) => {
      acc[varName] = import.meta.env[varName] || undefined;
      return acc;
    }, {}),
    optional: optionalEnvVars.reduce((acc, varName) => {
      acc[varName] = import.meta.env[varName] || undefined;
      return acc;
    }, {})
  };
};
