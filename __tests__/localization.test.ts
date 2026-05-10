import { pickAppLanguage, i18n } from '../src/localization/i18n';

describe('Localization', () => {
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
