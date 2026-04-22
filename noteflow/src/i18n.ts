import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'fr', 'it'],
    ns: ['common'],
    defaultNS: 'common',
    backend: { loadPath: `${import.meta.env.BASE_URL}locales/{{lng}}/{{ns}}.json` },
    interpolation: { escapeValue: false },
    react: { useSuspense: true },
  });

export default i18n;
