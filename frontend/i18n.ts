import i18n from "i18next";

import enTranslation from "./src/locales/en/translation.json";
import mkTranslation from "./src/locales/mk/translation.json";
import { initReactI18next } from "react-i18next";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslation },
      mk: { translation: mkTranslation }
    },
    lng: "en",
    fallbackLng: "en",
    interpolation: { escapeValue: false }
  });

export default i18n;
