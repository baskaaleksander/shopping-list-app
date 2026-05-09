import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '../../../components/Screen';
import { appStrings } from '../../../localization/messages';
import { useSession } from '../../../app/providers/SessionProvider';

export function ShoppingListsHomeScreen() {
  const { session, signOut } = useSession();

  return (
    <Screen>
      <View style={styles.content}>
        <Text style={styles.title}>{appStrings.shoppingLists.title}</Text>
        <Text style={styles.subtitle}>{appStrings.shoppingLists.subtitle}</Text>
        <Text style={styles.status}>
          {session?.user.email ?? appStrings.shoppingLists.noEmail}
        </Text>
        <Pressable onPress={() => void signOut()} style={styles.button}>
          <Text style={styles.buttonText}>
            {appStrings.shoppingLists.signOutAction}
          </Text>
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
  button: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#111827',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  buttonText: {
    color: '#f9fafb',
    fontSize: 16,
    fontWeight: '600',
  },
});
