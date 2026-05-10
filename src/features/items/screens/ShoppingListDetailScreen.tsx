import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { AppLoader } from '../../../components/AppLoader';
import { EmptyState } from '../../../components/EmptyState';
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

  const items = itemsQuery.data ?? [];

  if (itemsQuery.error instanceof Error) {
    return <Screen centered>{t(itemsQuery.error.message)}</Screen>;
  }

  const completedCount = items.filter((item) => item.completed).length;

  return (
    <Screen>
      <FlatList
        contentContainerStyle={styles.content}
        data={items}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <EmptyState
            description={t('items.emptyDescription')}
            title={t('items.emptyTitle')}
          />
        }
        ListHeaderComponent={
          <View style={styles.summaryCard}>
            <Text style={styles.summaryEyebrow}>
              {t('shoppingLists.progressLabel')}
            </Text>
            <Text style={styles.summaryTitle}>{route.params.listName}</Text>
            <Text style={styles.summaryValue}>
              {t('shoppingLists.progressValue', {
                completed: completedCount,
                total: items.length,
              })}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View
            style={[styles.card, item.completed ? styles.completedCard : null]}
          >
            <Text
              style={[
                styles.title,
                item.completed ? styles.completedTitle : null,
              ]}
            >
              {item.name}
            </Text>
            <Text style={styles.meta}>
              {t('items.quantityValue', { count: item.quantity })}
            </Text>
            <Text
              style={[
                styles.status,
                item.completed ? styles.completedStatus : null,
              ]}
            >
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
  completedCard: {
    backgroundColor: '#ecfdf5',
    borderColor: '#86efac',
  },
  completedStatus: {
    color: '#166534',
    fontWeight: '600',
  },
  completedTitle: {
    color: '#4b5563',
    textDecorationLine: 'line-through',
  },
  meta: {
    color: '#6b7280',
    fontSize: 14,
    lineHeight: 20,
  },
  status: {
    color: '#1f2937',
    fontSize: 14,
    lineHeight: 20,
  },
  summaryCard: {
    backgroundColor: '#111827',
    borderRadius: 20,
    gap: 8,
    marginBottom: 8,
    padding: 18,
  },
  summaryEyebrow: {
    color: '#93c5fd',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  summaryTitle: {
    color: '#f9fafb',
    fontSize: 22,
    fontWeight: '700',
  },
  summaryValue: {
    color: '#e5e7eb',
    fontSize: 15,
    lineHeight: 22,
  },
  title: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '700',
  },
});
