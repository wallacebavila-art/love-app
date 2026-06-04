// Importar traduções
import translationPT from './locales/pt-BR.json';
import translationEN from './locales/en.json';

const resources = {
  'pt-BR': {
    translation: translationPT
  },
  en: {
    translation: translationEN
  }
};

let i18nInstance = null;

const initI18n = async () => {
  try {
    const i18n = await import('i18next');
    const { initReactI18next } = await import('react-i18next');

    i18nInstance = i18n.default;
    i18nInstance
      .use(initReactI18next)
      .init({
        resources,
        lng: localStorage.getItem('language') || 'pt-BR',
        fallbackLng: 'pt-BR',
        interpolation: {
          escapeValue: false
        }
      });
  } catch (error) {
    console.warn('i18next dependencies not installed, i18n disabled');
    i18nInstance = {
      t: (key) => key,
      changeLanguage: () => {},
      language: 'pt-BR'
    };
  }
};

// Inicializar i18n
initI18n();

export default i18nInstance;
