import { getLocales } from 'expo-localization';
import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

import { en } from './resources/en';
import { pl } from './resources/pl';

export type AppLanguage = 'en' | 'pl';

const i18n = createInstance();

export function resolveAppLanguage(): AppLanguage {
  const locale = getLocales()[0];
  const languageCode = locale?.languageCode?.toLowerCase();
  const fallbackCode = locale?.languageTag?.split('-')[0]?.toLowerCase();
  const resolvedCode = languageCode ?? fallbackCode;

  return resolvedCode === 'pl' ? 'pl' : 'en';
}

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    compatibilityJSON: 'v4',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    lng: resolveAppLanguage(),
    resources: {
      en: {
        translation: en,
      },
      pl: {
        translation: pl,
      },
    },
  });
}

export { i18n };
