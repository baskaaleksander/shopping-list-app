import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useSession } from '../../../app/providers/SessionProvider';
import { AppButton } from '../../../components/AppButton';
import { AppDialog } from '../../../components/AppDialog';
import { Screen } from '../../../components/Screen';

export function AccountManagementScreen() {
  const { session, signOut } = useSession();
  const { t } = useTranslation();
  const [isSignOutDialogVisible, setSignOutDialogVisible] = useState(false);
  const [isSigningOut, setSigningOut] = useState(false);

  const email = session?.user.email ?? t('shoppingLists.noEmail');
  const userId = session?.user.id ?? '-';

  function closeSignOutDialog() {
    if (isSigningOut) {
      return;
    }

    setSignOutDialogVisible(false);
  }

  async function handleSignOut() {
    setSigningOut(true);

    try {
      await signOut();
      setSignOutDialogVisible(false);
    } catch {
      Alert.alert(
        t('common.feedback.errorTitle'),
        t('common.errors.saveFailed'),
      );
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <Screen>
      <View style={styles.content}>
        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>{t('account.title')}</Text>
          <Text style={styles.heroTitle}>{email}</Text>
          <Text style={styles.heroDescription}>{t('account.subtitle')}</Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>
            {t('account.profileSettings')}
          </Text>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>{t('account.emailLabel')}</Text>
            <Text style={styles.fieldValue}>{email}</Text>
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>{t('account.userIdLabel')}</Text>
            <Text style={styles.fieldValue}>{userId}</Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{t('account.sessionTitle')}</Text>
          <Text style={styles.sessionDescription}>
            {t('account.sessionHint')}
          </Text>
          <AppButton onPress={() => setSignOutDialogVisible(true)}>
            {t('account.signOutAction')}
          </AppButton>
        </View>
      </View>

      <AppDialog
        actions={
          <>
            <AppButton
              disabled={isSigningOut}
              onPress={closeSignOutDialog}
              variant="secondary"
            >
              {t('common.actions.cancel')}
            </AppButton>
            <AppButton
              disabled={isSigningOut}
              onPress={() => void handleSignOut()}
            >
              {isSigningOut
                ? t('account.signingOut')
                : t('account.signOutAction')}
            </AppButton>
          </>
        }
        message={t('account.signOutMessage')}
        onRequestClose={closeSignOutDialog}
        title={t('account.signOutTitle')}
        visible={isSignOutDialogVisible}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
  },
  eyebrow: {
    color: '#93c5fd',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  fieldLabel: {
    color: '#6b7280',
    fontSize: 13,
    fontWeight: '600',
  },
  fieldRow: {
    gap: 4,
  },
  fieldValue: {
    color: '#111827',
    fontSize: 15,
    lineHeight: 22,
  },
  heroCard: {
    backgroundColor: '#111827',
    borderRadius: 20,
    gap: 8,
    padding: 18,
  },
  heroDescription: {
    color: '#d1d5db',
    fontSize: 14,
    lineHeight: 22,
  },
  heroTitle: {
    color: '#f9fafb',
    fontSize: 22,
    fontWeight: '700',
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    borderRadius: 20,
    borderWidth: 1,
    gap: 12,
    padding: 18,
  },
  sectionTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '700',
  },
  sessionDescription: {
    color: '#4b5563',
    fontSize: 14,
    lineHeight: 22,
  },
});
