import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { AppButton } from '../../../components/AppButton';
import { AppTextInput } from '../../../components/AppTextInput';
import { EmptyState } from '../../../components/EmptyState';
import { Screen } from '../../../components/Screen';
import type { RootStackParamList } from '../../../types/navigation';
import { signInWithEmail } from '../api';
import { validateSignIn } from '../validation';

type Props = NativeStackScreenProps<RootStackParamList, 'SignIn'>;

export function SignInScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSignIn() {
    const validationError = validateSignIn({ email, password });

    if (validationError) {
      setErrorKey(validationError);
      return;
    }

    setIsSubmitting(true);
    setErrorKey(null);

    const result = await signInWithEmail(email.trim(), password);

    setIsSubmitting(false);
    setErrorKey(result.errorKey);
  }

  return (
    <Screen>
      <View style={styles.content}>
        <EmptyState
          description={t('auth.guestHint')}
          title={t('auth.signInTitle')}
        />
        <AppTextInput
          autoCapitalize="none"
          label={t('auth.emailLabel')}
          onChangeText={setEmail}
          value={email}
        />
        <AppTextInput
          autoCapitalize="none"
          label={t('auth.passwordLabel')}
          onChangeText={setPassword}
          secureTextEntry
          value={password}
        />
        {errorKey ? <Text style={styles.error}>{t(errorKey)}</Text> : null}
        <AppButton disabled={isSubmitting} onPress={() => void handleSignIn()}>
          {isSubmitting ? t('auth.loadingSignIn') : t('auth.signInAction')}
        </AppButton>
        <AppButton
          onPress={() => navigation.navigate('SignUp')}
          variant="secondary"
        >
          {t('auth.switchToSignUp')}
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
  error: {
    color: '#b91c1c',
    fontSize: 14,
    lineHeight: 22,
  },
});
