import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import Feather from '@expo/vector-icons/Feather';

import { AppLoader } from '../../../components/AppLoader';
import { AppButton } from '../../../components/AppButton';
import { AppTextInput } from '../../../components/AppTextInput';
import { EmptyState } from '../../../components/EmptyState';
import { Screen } from '../../../components/Screen';
import { useSession } from '../../../app/providers/SessionProvider';
import type { RootStackParamList, SessionUser } from '../../../types';
import type { ShoppingListSummary } from '../api';

import {
  createShoppingList,
  deleteShoppingList,
  fetchShoppingLists,
  renameShoppingList,
} from '../api';

type Props = NativeStackScreenProps<RootStackParamList, 'ShoppingListsHome'>;

function sortShoppingLists(lists: ShoppingListSummary[]) {
  return [...lists].sort(
    (left, right) =>
      new Date(right.updated_at).getTime() -
      new Date(left.updated_at).getTime(),
  );
}

function formatDate(date: string, language: string) {
  try {
    return new Intl.DateTimeFormat(language, {
      dateStyle: 'medium',
    }).format(new Date(date));
  } catch {
    return date;
  }
}

export function ShoppingListsHomeScreen({ navigation }: Props) {
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

          return sortShoppingLists([newList, ...existingLists]);
        },
      );
      setDraftName('');
      setCreateErrorKey(null);
      Alert.alert(
        t('common.feedback.successTitle'),
        t('common.feedback.listCreated'),
      );
    },
  });

  const renameListMutation = useMutation({
    mutationFn: async ({ listId, name }: { listId: string; name: string }) => {
      if (!user?.id) {
        throw new Error('common.errors.saveFailed');
      }

      const result = await renameShoppingList(listId, user.id, { name });

      if (result.errorKey || !result.data) {
        throw new Error(result.errorKey ?? 'common.errors.saveFailed');
      }

      return result.data;
    },
    onSuccess: (updatedList) => {
      queryClient.setQueryData(
        ['shopping-lists', user?.id],
        (currentLists: typeof shoppingListsQuery.data) => {
          const existingLists = currentLists ?? [];

          return sortShoppingLists(
            existingLists.map((list) =>
              list.id === updatedList.id
                ? {
                    ...list,
                    ...updatedList,
                  }
                : list,
            ),
          );
        },
      );
      Alert.alert(
        t('common.feedback.successTitle'),
        t('common.feedback.listRenamed'),
      );
    },
  });

  const deleteListMutation = useMutation({
    mutationFn: async (listId: string) => {
      if (!user?.id) {
        throw new Error('common.errors.deleteFailed');
      }

      const result = await deleteShoppingList(listId, user.id);

      if (result.errorKey) {
        throw new Error(result.errorKey);
      }
    },
    onSuccess: (_data, deletedListId) => {
      queryClient.setQueryData(
        ['shopping-lists', user?.id],
        (currentLists: typeof shoppingListsQuery.data) => {
          const existingLists = currentLists ?? [];

          return existingLists.filter((list) => list.id !== deletedListId);
        },
      );
      Alert.alert(
        t('common.feedback.successTitle'),
        t('common.feedback.listDeleted'),
      );
    },
    onError: (error) => {
      Alert.alert(
        t('common.feedback.errorTitle'),
        t('common.errors.deleteFailed'),
      );
    },
  });

  useEffect(() => {
    if (shoppingListsQuery.error) {
      Alert.alert(
        t('common.feedback.errorTitle'),
        t('common.errors.loadFailed'),
      );
    }
  }, [shoppingListsQuery.error, t]);

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
      Alert.alert(
        t('common.feedback.errorTitle'),
        t(error instanceof Error ? error.message : 'common.errors.saveFailed'),
      );
    }
  }

  async function handleRenameList(listId: string, newName: string = '') {
    const trimmedName = newName.trim();

    if (!trimmedName) {
      Alert.alert(
        t('common.feedback.errorTitle'),
        t('validation.requiredListName'),
      );
      return;
    }

    try {
      await renameListMutation.mutateAsync({
        listId,
        name: trimmedName,
      });
    } catch (error) {
      Alert.alert(
        t('common.feedback.errorTitle'),
        t(error instanceof Error ? error.message : 'common.errors.saveFailed'),
      );
    }
  }

  function startRename(list: ShoppingListSummary) {
    Alert.prompt(
      t('shoppingLists.renameTitle'),
      '',
      [
        {
          text: t('common.actions.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.actions.confirm'),
          onPress: (text?: string) => handleRenameList(list.id, text),
        },
      ],
      'plain-text',
      list.name,
    );
  }

  function confirmDeleteList(list: ShoppingListSummary) {
    Alert.alert(
      t('shoppingLists.confirmDeleteTitle'),
      `${t('shoppingLists.confirmDeleteMessage', { name: list.name })}\n\n${t('shoppingLists.actionCannotBeUndone')}`,
      [
        {
          style: 'cancel',
          text: t('common.actions.cancel'),
        },
        {
          onPress: () => {
            deleteListMutation.mutate(list.id);
          },
          style: 'destructive',
          text: t('shoppingLists.deleteAction'),
        },
      ],
    );
  }

  if (shoppingListsQuery.isPending) {
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
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <View style={styles.cardActions}>
                <Pressable
                  onPress={() => startRename(item)}
                  style={({ pressed }) => [
                    styles.iconButton,
                    pressed ? styles.actionPressed : null,
                  ]}
                  accessibilityLabel={t('shoppingLists.renameAction')}
                >
                  <Feather name="edit-2" size={20} color="#374151" />
                </Pressable>
                <Pressable
                  onPress={() => confirmDeleteList(item)}
                  style={({ pressed }) => [
                    styles.iconButton,
                    pressed ? styles.actionPressed : null,
                  ]}
                  accessibilityLabel={t('shoppingLists.deleteAction')}
                >
                  <Feather name="trash-2" size={20} color="#b91c1c" />
                </Pressable>
              </View>
            </View>
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
            <Pressable
              onPress={() =>
                navigation.navigate('ShoppingListDetail', {
                  listId: item.id,
                  listName: item.name,
                })
              }
              style={({ pressed }) => [
                styles.linkButton,
                pressed ? styles.actionPressed : null,
              ]}
            >
              <Text style={styles.linkButtonText}>
                {t('shoppingLists.openAction')}
              </Text>
            </Pressable>
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cardTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  iconButton: {
    padding: 4,
  },
  actionButton: {
    alignItems: 'center',
    borderRadius: 12,
    flex: 1,
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  actionPressed: {
    opacity: 0.85,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  error: {
    color: '#b91c1c',
    fontSize: 14,
    lineHeight: 22,
  },
  destructiveAction: {
    backgroundColor: '#b91c1c',
  },
  destructiveActionText: {
    color: '#fef2f2',
    fontSize: 14,
    fontWeight: '600',
  },
  form: {
    gap: 12,
  },
  linkButton: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  linkButtonText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '600',
  },
  primaryAction: {
    backgroundColor: '#111827',
  },
  primaryActionText: {
    color: '#f9fafb',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryAction: {
    backgroundColor: '#e5e7eb',
  },
  secondaryActionText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
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
