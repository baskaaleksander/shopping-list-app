import { pickAppLanguage } from '../src/localization/i18n';

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
