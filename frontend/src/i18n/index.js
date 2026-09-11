import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const SUPPORTED_LANGUAGES = ['en', 'am', 'om'];
const STORAGE_KEY = 'osta_language';

function getInitialLanguage() {
  if (typeof window === 'undefined') return 'en';

  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (SUPPORTED_LANGUAGES.includes(saved)) return saved;

  const browserLanguage = window.navigator.language?.toLowerCase().split('-')[0];
  return SUPPORTED_LANGUAGES.includes(browserLanguage) ? browserLanguage : 'en';
}

// i18next is the long-term internationalization engine for OSTA.
// The existing LanguageContext dictionary remains compatible while the UI is
// migrated screen-by-screen to useTranslation().
i18n.use(initReactI18next).init({
  lng: getInitialLanguage(),
  fallbackLng: 'en',
  supportedLngs: SUPPORTED_LANGUAGES,
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

export { STORAGE_KEY, SUPPORTED_LANGUAGES };
export default i18n;
