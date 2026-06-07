import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useLocalization } from '../../../app/providers/LocalizationProvider';
import { useSession } from '../../../app/providers/SessionProvider';
import { useToast } from '../../../app/providers/ToastProvider';
import { AppButton } from '../../../components/AppButton';
import { AppDialog } from '../../../components/AppDialog';
import { Screen } from '../../../components/Screen';
import type { AppLanguage } from '../../../localization/i18n';

export function AccountManagementScreen() {
  const { session, signOut } = useSession();
  const { language, setLanguage } = useLocalization();
  const { i18n, t } = useTranslation();
  const { showToast } = useToast();
  const [isChangingLanguage, setChangingLanguage] = useState(false);
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
      showToast({
        message: t('common.errors.saveFailed'),
        title: t('common.feedback.errorTitle'),
        variant: 'error',
      });
    } finally {
      setSigningOut(false);
    }
  }

  async function handleLanguageChange(nextLanguage: AppLanguage) {
    if (isChangingLanguage || nextLanguage === language) {
      return;
    }

    setChangingLanguage(true);

    try {
      await setLanguage(nextLanguage);

      const nextT = i18n.getFixedT(nextLanguage);

      showToast({
        message: nextT('account.languageChanged'),
        title: nextT('common.feedback.successTitle'),
      });
    } catch {
      showToast({
        message: t('common.errors.saveFailed'),
        title: t('common.feedback.errorTitle'),
        variant: 'error',
      });
    } finally {
      setChangingLanguage(false);
    }
  }

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
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
          <Text style={styles.sectionTitle}>{t('account.languageTitle')}</Text>
          <Text style={styles.sessionDescription}>
            {t('account.languageHint')}
          </Text>
          <View style={styles.languageOptions}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: isChangingLanguage, selected: language === 'en' }}
              disabled={isChangingLanguage}
              onPress={() => void handleLanguageChange('en')}
              style={({ pressed }) => [
                styles.languageOption,
                language === 'en' ? styles.languageOptionActive : null,
                isChangingLanguage ? styles.languageOptionDisabled : null,
                pressed && !isChangingLanguage ? styles.languageOptionPressed : null,
              ]}
            >
              <Text
                style={[
                  styles.languageOptionText,
                  language === 'en' ? styles.languageOptionTextActive : null,
                ]}
              >
                {t('account.languageOptionEnglish')}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: isChangingLanguage, selected: language === 'pl' }}
              disabled={isChangingLanguage}
              onPress={() => void handleLanguageChange('pl')}
              style={({ pressed }) => [
                styles.languageOption,
                language === 'pl' ? styles.languageOptionActive : null,
                isChangingLanguage ? styles.languageOptionDisabled : null,
                pressed && !isChangingLanguage ? styles.languageOptionPressed : null,
              ]}
            >
              <Text
                style={[
                  styles.languageOptionText,
                  language === 'pl' ? styles.languageOptionTextActive : null,
                ]}
              >
                {t('account.languageOptionPolish')}
              </Text>
            </Pressable>
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
      </ScrollView>

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
  languageOption: {
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  languageOptionActive: {
    backgroundColor: '#111827',
  },
  languageOptionDisabled: {
    opacity: 0.7,
  },
  languageOptionPressed: {
    opacity: 0.85,
  },
  languageOptionText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  languageOptionTextActive: {
    color: '#f9fafb',
  },
  languageOptions: {
    gap: 10,
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
