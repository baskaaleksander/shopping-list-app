import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { AppLoader } from '../../../components/AppLoader';
import { AppButton } from '../../../components/AppButton';
import { AppTextInput } from '../../../components/AppTextInput';
import { EmptyState } from '../../../components/EmptyState';
import { Screen } from '../../../components/Screen';
import { useSession } from '../../../app/providers/SessionProvider';
import type { SessionUser } from '../../../types/auth';

import { createShoppingList, fetchShoppingLists } from '../api';

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
  const queryClient = useQueryClient();
  const [draftName, setDraftName] = useState('');
  const [createErrorKey, setCreateErrorKey] = useState<string | null>(null);
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

  const createListMutation = useMutation({
    mutationFn: async (name: string) => {
      if (!user?.id) {
        throw new Error('common.errors.saveFailed');
      }

      const result = await createShoppingList({
        name,
        user_id: user.id,
      });

      if (result.errorKey || !result.data) {
        throw new Error(result.errorKey ?? 'common.errors.saveFailed');
      }

      return result.data;
    },
    onSuccess: (newList) => {
      queryClient.setQueryData(
        ['shopping-lists', user?.id],
        (currentLists: typeof shoppingListsQuery.data) => {
          const existingLists = currentLists ?? [];

          return [newList, ...existingLists];
        },
      );
      setDraftName('');
      setCreateErrorKey(null);
    },
  });

  const queryErrorKey = useMemo(() => {
    if (!(shoppingListsQuery.error instanceof Error)) {
      return null;
    }

    return shoppingListsQuery.error.message;
  }, [shoppingListsQuery.error]);

  async function handleCreateList() {
    const trimmedName = draftName.trim();

    if (!trimmedName) {
      setCreateErrorKey('validation.requiredListName');
      return;
    }

    setCreateErrorKey(null);

    try {
      await createListMutation.mutateAsync(trimmedName);
    } catch (error) {
      setCreateErrorKey(
        error instanceof Error ? error.message : 'common.errors.saveFailed',
      );
    }
  }

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
            <View style={styles.form}>
              <AppTextInput
                label={t('shoppingLists.createTitle')}
                onChangeText={setDraftName}
                placeholder={t('shoppingLists.namePlaceholder')}
                value={draftName}
              />
              {createErrorKey ? (
                <Text style={styles.error}>{t(createErrorKey)}</Text>
              ) : null}
              <AppButton
                disabled={createListMutation.isPending}
                onPress={() => void handleCreateList()}
              >
                {createListMutation.isPending
                  ? t('shoppingLists.creating')
                  : t('shoppingLists.createAction')}
              </AppButton>
            </View>
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
  error: {
    color: '#b91c1c',
    fontSize: 14,
    lineHeight: 22,
  },
  form: {
    gap: 12,
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
