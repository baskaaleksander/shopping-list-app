import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '../../../components/Screen';
import { appStrings } from '../../../localization/messages';
import { useSession } from '../../../app/providers/SessionProvider';

export function AuthWelcomeScreen() {
  const { configError } = useSession();

  return (
    <Screen>
      <View style={styles.content}>
        <Text style={styles.title}>{appStrings.auth.title}</Text>
        <Text style={styles.subtitle}>{appStrings.auth.subtitle}</Text>
        <Text style={styles.status}>{appStrings.auth.nextStep}</Text>
        {configError ? <Text style={styles.error}>{configError}</Text> : null}
        <Pressable disabled style={styles.button}>
          <Text style={styles.buttonText}>{appStrings.auth.primaryAction}</Text>
        </Pressable>
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
  title: {
    color: '#111827',
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: '#374151',
    fontSize: 16,
    lineHeight: 24,
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
  button: {
    alignItems: 'center',
    backgroundColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  buttonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
});
