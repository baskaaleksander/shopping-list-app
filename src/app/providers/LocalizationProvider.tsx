import type { PropsWithChildren } from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { AppLoader } from '../../components/AppLoader';
import { Screen } from '../../components/Screen';
import {
  getStoredAppLanguage,
  i18n,
  persistAppLanguage,
  resolveAppLanguage,
  type AppLanguage,
} from '../../localization/i18n';

type LocalizationContextValue = {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => Promise<void>;
  status: 'loading' | 'ready';
};

const LocalizationContext = createContext<LocalizationContextValue | null>(null);

export function LocalizationProvider({ children }: PropsWithChildren) {
  const [language, setLanguageState] = useState<AppLanguage>(
    i18n.language === 'pl' ? 'pl' : 'en',
  );
  const [status, setStatus] = useState<'loading' | 'ready'>('loading');

  useEffect(() => {
    let isMounted = true;

    async function restoreLanguagePreference() {
      let nextLanguage = resolveAppLanguage();

      try {
        nextLanguage = (await getStoredAppLanguage()) ?? nextLanguage;
        await i18n.changeLanguage(nextLanguage);
      } finally {
        if (!isMounted) {
          return;
        }

        setLanguageState(nextLanguage);
        setStatus('ready');
      }
    }

    void restoreLanguagePreference();

    return () => {
      isMounted = false;
    };
  }, []);

  const setLanguage = useCallback(
    async (nextLanguage: AppLanguage) => {
      if (nextLanguage === language) {
        return;
      }

      await i18n.changeLanguage(nextLanguage);
      setLanguageState(nextLanguage);
      await persistAppLanguage(nextLanguage);
    },
    [language],
  );

  const value = useMemo<LocalizationContextValue>(
    () => ({
      language,
      setLanguage,
      status,
    }),
    [language, setLanguage, status],
  );

  if (status === 'loading') {
    return (
      <Screen centered>
        <AppLoader label={i18n.t('shell.loadingPreferences')} />
      </Screen>
    );
  }

  return (
    <LocalizationContext.Provider value={value}>
      {children}
    </LocalizationContext.Provider>
  );
}

export function useLocalization() {
  const context = useContext(LocalizationContext);

  if (!context) {
    throw new Error('useLocalization must be used within LocalizationProvider');
  }

  return context;
}
