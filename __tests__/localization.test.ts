import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  getStoredAppLanguage,
  i18n,
  isAppLanguage,
  pickAppLanguage,
  persistAppLanguage,
} from '../src/localization/i18n';

describe('Localization', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  describe('pickAppLanguage', () => {
    it('prefers Polish device locales', () => {
      expect(
        pickAppLanguage([{ languageCode: 'pl', languageTag: 'pl-PL' }]),
      ).toBe('pl');
    });

    it('falls back to English for unsupported locales', () => {
      expect(
        pickAppLanguage([{ languageCode: 'de', languageTag: 'de-DE' }]),
      ).toBe('en');
    });
  });

  describe('stored language preference', () => {
    it('recognizes supported app languages', () => {
      expect(isAppLanguage('en')).toBe(true);
      expect(isAppLanguage('pl')).toBe(true);
      expect(isAppLanguage('de')).toBe(false);
      expect(isAppLanguage(null)).toBe(false);
    });

    it('persists and restores the selected app language', async () => {
      await persistAppLanguage('pl');

      await expect(getStoredAppLanguage()).resolves.toBe('pl');
    });

    it('ignores unsupported stored values', async () => {
      await AsyncStorage.setItem('shopping-list-app.language', 'de');

      await expect(getStoredAppLanguage()).resolves.toBeNull();
    });
  });

  describe('Fallback Behavior', () => {
    it('falls back to English text if translation is missing in another language', async () => {
      // Wait for i18n to initialize if it hasn't
      await i18n.init();

      i18n.addResource(
        'en',
        'translation',
        'test.fallbackKey',
        'Fallback English Text',
      );

      await i18n.changeLanguage('pl');

      expect(i18n.t('test.fallbackKey')).toBe('Fallback English Text');
    });
  });
});
