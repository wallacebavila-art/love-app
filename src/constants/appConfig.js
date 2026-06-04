/**
 * Configurações centralizadas do aplicativo
 * Todos os valores hardcoded foram movidos para este arquivo
 */

// YouTube
export const YOUTUBE_PLAYLIST_ID = import.meta.env.VITE_YOUTUBE_PLAYLIST_ID || 'PL7Z2KjbeQrjT0TQw0_3JZAFJF9hhwdVOQ';
export const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

// Google Maps
export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// OpenWeatherMap
export const OPENWEATHERMAP_API_KEY = import.meta.env.VITE_OPENWEATHERMAP_API_KEY;

// Firebase
export const FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL
};

// FCM
export const FCM_VAPID_KEY = import.meta.env.VITE_FCM_VAPID_KEY;

// iCloud Calendar
export const ICLOUD_CALENDAR_URL = import.meta.env.VITE_ICLOUD_CALENDAR_URL || 'webcal://p53-caldav.icloud.com/published/2/MjEzNzMzMjM4NDIyMTM3M5EAdSTRxD1rffBLU84wLQGIjX5WKiOvBlRSnSfjgWZ-sN4vXdQ_gCoeoR_j7_xzsVmRLXKS25VrtuiAeMv7NeE';
export const CORS_PROXY_URL = import.meta.env.VITE_CORS_PROXY_URL || 'https://corsproxy.io/?';

// Relationship
export const RELATIONSHIP_START_DATE = import.meta.env.VITE_RELATIONSHIP_START_DATE || '2026-01-12';
export const DEFAULT_RELATIONSHIP_START_DATE = '2026-01-12';

// Weather
export const WEATHER_CITY = import.meta.env.VITE_WEATHER_CITY || 'Rio de Janeiro';

// User Roles
export const ADMIN_EMAILS = import.meta.env.VITE_ADMIN_EMAILS ? import.meta.env.VITE_ADMIN_EMAILS.split(',') : [];
export const RAISSA_EMAILS = import.meta.env.VITE_RAISSA_EMAILS ? import.meta.env.VITE_RAISSA_EMAILS.split(',') : [];

// Music Player
export const MAX_YOUTUBE_TRACKS = 100;
export const YOUTUBE_TRACK_UPDATE_DELAY_1 = 1000;
export const YOUTUBE_TRACK_UPDATE_DELAY_2 = 2000;

// Analytics
export const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
export const PLAUSIBLE_DOMAIN = import.meta.env.VITE_PLAUSIBLE_DOMAIN;
export const PLAUSIBLE_URL = import.meta.env.VITE_PLAUSIBLE_URL || 'https://plausible.io';
export const ANALYTICS_ENABLED = import.meta.env.VITE_ANALYTICS_ENABLED === 'true';
