import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppButton } from '../../../components/AppButton';
import { EmptyState } from '../../../components/EmptyState';
import { Screen } from '../../../components/Screen';
import { useSession } from '../../../app/providers/SessionProvider';

export function AuthWelcomeScreen() {
  const { configErrorKey } = useSession();
  const { t } = useTranslation();

  return (
    <Screen>
      <View style={styles.content}>
        <EmptyState description={t('auth.subtitle')} title={t('auth.title')} />
        <Text style={styles.status}>{t('auth.nextStep')}</Text>
        {configErrorKey ? (
          <Text style={styles.error}>{t(configErrorKey)}</Text>
        ) : null}
        <AppButton disabled variant="secondary">
          {t('auth.primaryAction')}
        </AppButton>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    gap: 16,
    justifyContent: 'center',
  },
  status: {
    color: '#6b7280',
    fontSize: 14,
    lineHeight: 22,
  },
  error: {
    color: '#b91c1c',
    fontSize: 14,
    lineHeight: 22,
  },
});
