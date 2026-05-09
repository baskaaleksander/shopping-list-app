import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { AppButton } from '../../../components/AppButton';
import { AppTextInput } from '../../../components/AppTextInput';
import { EmptyState } from '../../../components/EmptyState';
import { Screen } from '../../../components/Screen';
import type { RootStackParamList } from '../../../types/navigation';
import { signUpWithProfile } from '../api';
import { validateSignUp } from '../validation';

type Props = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

export function SignUpScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSignUp() {
    const validationError = validateSignUp({ email, password, username });

    if (validationError) {
      setErrorKey(validationError);
      return;
    }

    setIsSubmitting(true);
    setErrorKey(null);

    const result = await signUpWithProfile(
      email.trim(),
      password,
      username.trim(),
    );

    setIsSubmitting(false);
    setErrorKey(result.errorKey);
  }

  return (
    <Screen>
      <View style={styles.content}>
        <EmptyState
          description={t('auth.subtitle')}
          title={t('auth.signUpTitle')}
        />
        <AppTextInput
          autoCapitalize="none"
          label={t('auth.emailLabel')}
          onChangeText={setEmail}
          value={email}
        />
        <AppTextInput
          autoCapitalize="none"
          label={t('auth.usernameLabel')}
          onChangeText={setUsername}
          value={username}
        />
        <AppTextInput
          autoCapitalize="none"
          label={t('auth.passwordLabel')}
          onChangeText={setPassword}
          secureTextEntry
          value={password}
        />
        {errorKey ? <Text style={styles.error}>{t(errorKey)}</Text> : null}
        <AppButton disabled={isSubmitting} onPress={() => void handleSignUp()}>
          {isSubmitting ? t('auth.loadingSignUp') : t('auth.signUpAction')}
        </AppButton>
        <AppButton
          onPress={() => navigation.navigate('SignIn')}
          variant="secondary"
        >
          {t('auth.switchToSignIn')}
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
