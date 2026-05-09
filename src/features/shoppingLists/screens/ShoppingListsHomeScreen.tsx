import { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { AppLoader } from '../../../components/AppLoader';
import { AppButton } from '../../../components/AppButton';
import { EmptyState } from '../../../components/EmptyState';
import { Screen } from '../../../components/Screen';
import { useSession } from '../../../app/providers/SessionProvider';
import type { SessionUser } from '../../../types/auth';

import { fetchShoppingLists } from '../api';

function formatDate(date: string, language: string) {
  try {
    return new Intl.DateTimeFormat(language, {
      dateStyle: 'medium',
    }).format(new Date(date));
  } catch {
    return date;
  }
}

export function ShoppingListsHomeScreen() {
  const { session, signOut } = useSession();
  const { i18n, t } = useTranslation();
  const user: SessionUser | null = session?.user
    ? {
        email: session.user.email ?? null,
        id: session.user.id,
      }
    : null;

  const shoppingListsQuery = useQuery({
    enabled: Boolean(user?.id),
    queryFn: async () => {
      if (!user?.id) {
        return [];
      }

      const result = await fetchShoppingLists(user.id);

      if (result.errorKey) {
        throw new Error(result.errorKey);
      }

      return result.data ?? [];
    },
    queryKey: ['shopping-lists', user?.id],
  });

  const queryErrorKey = useMemo(() => {
    if (!(shoppingListsQuery.error instanceof Error)) {
      return null;
    }

    return shoppingListsQuery.error.message;
  }, [shoppingListsQuery.error]);

  if (shoppingListsQuery.isLoading) {
    return (
      <Screen centered>
        <AppLoader label={t('shoppingLists.loading')} />
      </Screen>
    );
  }

  return (
    <Screen>
      <FlatList
        contentContainerStyle={styles.content}
        data={shoppingListsQuery.data ?? []}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          queryErrorKey ? (
            <View style={styles.stack}>
              <EmptyState
                description={t(queryErrorKey)}
                title={t('shoppingLists.loadFailedTitle')}
              />
            </View>
          ) : (
            <View style={styles.stack}>
              <EmptyState
                description={t('shoppingLists.emptyDescription')}
                title={t('shoppingLists.emptyTitle')}
              />
            </View>
          )
        }
        ListHeaderComponent={
          <View style={styles.stack}>
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
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardMeta}>
              {t('shoppingLists.updatedLabel', {
                date: formatDate(item.updated_at, i18n.language),
              })}
            </Text>
            <Text style={styles.cardMeta}>
              {t('shoppingLists.progressValue', {
                completed: item.completedCount,
                total: item.itemCount,
              })}
            </Text>
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
    padding: 16,
  },
  cardMeta: {
    color: '#6b7280',
    fontSize: 14,
    lineHeight: 22,
  },
  cardTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '700',
  },
  stack: {
    gap: 16,
  },
  status: {
    color: '#6b7280',
    fontSize: 14,
    lineHeight: 22,
  },
});
