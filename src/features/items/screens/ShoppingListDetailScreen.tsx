import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { AppLoader } from '../../../components/AppLoader';
import { Screen } from '../../../components/Screen';
import { useSession } from '../../../app/providers/SessionProvider';
import type { RootStackParamList, SessionUser } from '../../../types';

import { fetchShoppingListItems } from '../api';

type Props = NativeStackScreenProps<RootStackParamList, 'ShoppingListDetail'>;

export function ShoppingListDetailScreen({ route }: Props) {
  const { session } = useSession();
  const { t } = useTranslation();
  const user: SessionUser | null = session?.user
    ? {
        email: session.user.email ?? null,
        id: session.user.id,
      }
    : null;

  const itemsQuery = useQuery({
    enabled: Boolean(user?.id),
    queryFn: async () => {
      if (!user?.id) {
        return [];
      }

      const result = await fetchShoppingListItems(route.params.listId, user.id);

      if (result.errorKey) {
        throw new Error(result.errorKey);
      }

      return result.data ?? [];
    },
    queryKey: ['shopping-list-items', user?.id, route.params.listId],
  });

  if (itemsQuery.isLoading) {
    return (
      <Screen centered>
        <AppLoader label={t('items.loading')} />
      </Screen>
    );
  }

  if (itemsQuery.error instanceof Error) {
    return <Screen centered>{t(itemsQuery.error.message)}</Screen>;
  }

  return (
    <Screen>
      <FlatList
        contentContainerStyle={styles.content}
        data={itemsQuery.data ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.name}</Text>
            <Text style={styles.meta}>
              {t('items.quantityValue', { count: item.quantity })}
            </Text>
            <Text style={styles.meta}>
              {item.completed
                ? t('items.completedLabel')
                : t('items.pendingLabel')}
            </Text>
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
    padding: 16,
  },
  content: {
    gap: 12,
    paddingBottom: 24,
  },
  meta: {
    color: '#6b7280',
    fontSize: 14,
    lineHeight: 20,
  },
  title: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '700',
  },
});
