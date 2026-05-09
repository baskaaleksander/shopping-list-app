import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppButton } from '../../../components/AppButton';
import { EmptyState } from '../../../components/EmptyState';
import { Screen } from '../../../components/Screen';
import { useSession } from '../../../app/providers/SessionProvider';
import type { SessionUser } from '../../../types/auth';

export function ShoppingListsHomeScreen() {
  const { session, signOut } = useSession();
  const { t } = useTranslation();
  const user: SessionUser | null = session?.user
    ? {
        email: session.user.email ?? null,
        id: session.user.id,
      }
    : null;

  return (
    <Screen>
      <View style={styles.content}>
        <EmptyState
          description={t('shoppingLists.subtitle')}
          title={t('shoppingLists.title')}
        />
        <Text style={styles.status}>
          {user?.email ?? t('shoppingLists.noEmail')}
        </Text>
        <AppButton onPress={() => void signOut()}>
          {t('shoppingLists.signOutAction')}
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
});
