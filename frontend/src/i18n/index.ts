import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import fr from './locales/fr.json';
import pt from './locales/pt.json';
import ru from './locales/ru.json';
import zh from './locales/zh.json';
import hi from './locales/hi.json';
import ar from './locales/ar.json';
import am from './locales/am.json';
import fa from './locales/fa.json';
import id from './locales/id.json';

const resources = {
  en: { translation: en },
  fr: { translation: fr },
  pt: { translation: pt },
  ru: { translation: ru },
  zh: { translation: zh },
  hi: { translation: hi },
  ar: { translation: ar },
  am: { translation: am },
  fa: { translation: fa },
  id: { translation: id },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // Always start with English on server
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

// Set language from localStorage after hydration
if (typeof window !== 'undefined') {
  const savedLang = localStorage.getItem('bifa-lang');
  if (savedLang && savedLang !== i18n.language) {
    i18n.changeLanguage(savedLang);
  }
}

export default i18n;
