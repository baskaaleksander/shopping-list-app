import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

import { en } from './resources/en';
import { pl } from './resources/pl';

export type AppLanguage = 'en' | 'pl';
type DeviceLocale = {
  languageCode?: string | null;
  languageTag?: string | null;
};

const APP_LANGUAGE_STORAGE_KEY = 'shopping-list-app.language';
export const APP_LANGUAGES: readonly AppLanguage[] = ['en', 'pl'];

const i18n = createInstance();

export function isAppLanguage(value: string | null | undefined): value is AppLanguage {
  return value === 'en' || value === 'pl';
}

export function pickAppLanguage(locales: DeviceLocale[]): AppLanguage {
  const locale = locales[0];
  const languageCode = locale?.languageCode?.toLowerCase();
  const fallbackCode = locale?.languageTag?.split('-')[0]?.toLowerCase();
  const resolvedCode = languageCode ?? fallbackCode;

  return resolvedCode === 'pl' ? 'pl' : 'en';
}

export function resolveAppLanguage(): AppLanguage {
  return pickAppLanguage(getLocales());
}

export async function getStoredAppLanguage(): Promise<AppLanguage | null> {
  const storedLanguage = await AsyncStorage.getItem(APP_LANGUAGE_STORAGE_KEY);

  return isAppLanguage(storedLanguage) ? storedLanguage : null;
}

export async function persistAppLanguage(language: AppLanguage): Promise<void> {
  await AsyncStorage.setItem(APP_LANGUAGE_STORAGE_KEY, language);
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
