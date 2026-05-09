import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../../../components/AppButton';
import { EmptyState } from '../../../components/EmptyState';
import { Screen } from '../../../components/Screen';
import { appStrings } from '../../../localization/messages';
import { useSession } from '../../../app/providers/SessionProvider';
import type { SessionUser } from '../../../types/auth';

export function ShoppingListsHomeScreen() {
  const { session, signOut } = useSession();
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
          description={appStrings.shoppingLists.subtitle}
          title={appStrings.shoppingLists.title}
        />
        <Text style={styles.status}>
          {user?.email ?? appStrings.shoppingLists.noEmail}
        </Text>
        <AppButton onPress={() => void signOut()}>
          {appStrings.shoppingLists.signOutAction}
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
