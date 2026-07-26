import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import en from "./en.json";
import fr from "./fr.json";

// Bilingue FR/EN. La langue est detectee (navigateur, choix precedent)
// puis memorisee. Francais par defaut.
void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
      en: { translation: en },
    },
    fallbackLng: "fr",
    interpolation: { escapeValue: false },
  });

export default i18n;
