import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// import * as RNLocalize from 'react-native-localize';

const resources = {
  en: {
    translation: {
      // Tab titles
      chew: "Review",
      chat: "Ask",
      cast: "Compose",
      // Dashboard and navigation
      home: "Home",
      back: "Back",
      new_bookmark: "New Bookmark",
      manage_tags: "Manage Tags",
      manage_lists: "Manage Lists",
      new_list: "New List",
      theme: "Theme",
      // Add more translations as needed
    },
  },
  // Add other languages here
};

const languageDetector = {
  type: "languageDetector",
  async: true,
  detect: (callback: (lang: string) => void) => {
    const lang =
      typeof navigator !== "undefined" && navigator.language
        ? navigator.language.split("-")[0]
        : "en";
    callback(lang);
  },
  init: () => {},
  cacheUserLanguage: () => {},
};

i18n
  .use(languageDetector as any)
  .use(initReactI18next)
  .init({
    compatibilityJSON: "v3",
    resources,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
