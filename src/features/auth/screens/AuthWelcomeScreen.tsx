import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../../../components/AppButton';
import { EmptyState } from '../../../components/EmptyState';
import { Screen } from '../../../components/Screen';
import { appStrings } from '../../../localization/messages';
import { useSession } from '../../../app/providers/SessionProvider';

export function AuthWelcomeScreen() {
  const { configError } = useSession();

  return (
    <Screen>
      <View style={styles.content}>
        <EmptyState
          description={appStrings.auth.subtitle}
          title={appStrings.auth.title}
        />
        <Text style={styles.status}>{appStrings.auth.nextStep}</Text>
        {configError ? <Text style={styles.error}>{configError}</Text> : null}
        <AppButton disabled variant="secondary">
          {appStrings.auth.primaryAction}
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
