import { useMemo, useState } from 'react';
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

type FeedbackState = {
  key: string;
  tone: 'error' | 'success';
};

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
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState('');
  const [renameErrorKey, setRenameErrorKey] = useState<string | null>(null);
  const [deletingListId, setDeletingListId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
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
      setEditingListId(null);
      setRenameDraft('');
      setRenameErrorKey(null);
      setFeedback({
        key: 'common.feedback.listRenamed',
        tone: 'success',
      });
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
      if (editingListId === deletedListId) {
        cancelRename();
      }
      setFeedback({
        key: 'common.feedback.listDeleted',
        tone: 'success',
      });
    },
    onError: () => {
      setFeedback({
        key: 'common.errors.deleteFailed',
        tone: 'error',
      });
    },
    onSettled: () => {
      setDeletingListId(null);
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

  function startRename(list: ShoppingListSummary) {
    setEditingListId(list.id);
    setRenameDraft(list.name);
    setRenameErrorKey(null);
    setFeedback(null);
  }

  function cancelRename() {
    setEditingListId(null);
    setRenameDraft('');
    setRenameErrorKey(null);
  }

  async function handleRenameList(listId: string) {
    const trimmedName = renameDraft.trim();

    if (!trimmedName) {
      setRenameErrorKey('validation.requiredListName');
      return;
    }

    setRenameErrorKey(null);

    try {
      await renameListMutation.mutateAsync({
        listId,
        name: trimmedName,
      });
    } catch (error) {
      setRenameErrorKey(
        error instanceof Error ? error.message : 'common.errors.saveFailed',
      );
      setFeedback({
        key: 'common.errors.saveFailed',
        tone: 'error',
      });
    }
  }

  function confirmDeleteList(list: ShoppingListSummary) {
    Alert.alert(
      t('shoppingLists.confirmDeleteTitle'),
      t('shoppingLists.confirmDeleteMessage', { name: list.name }),
      [
        {
          style: 'cancel',
          text: t('common.actions.cancel'),
        },
        {
          onPress: () => {
            setDeletingListId(list.id);
            deleteListMutation.mutate(list.id);
          },
          style: 'destructive',
          text: t('shoppingLists.deleteAction'),
        },
      ],
    );
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
            {feedback ? (
              <Text
                style={
                  feedback.tone === 'error'
                    ? styles.feedbackError
                    : styles.feedbackSuccess
                }
              >
                {t(feedback.key)}
              </Text>
            ) : null}
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
            {editingListId === item.id ? (
              <View style={styles.form}>
                <AppTextInput
                  label={t('shoppingLists.renameTitle')}
                  onChangeText={setRenameDraft}
                  placeholder={t('shoppingLists.renamePlaceholder')}
                  value={renameDraft}
                />
                {renameErrorKey ? (
                  <Text style={styles.error}>{t(renameErrorKey)}</Text>
                ) : null}
                <View style={styles.actionRow}>
                  <Pressable
                    onPress={() => void handleRenameList(item.id)}
                    style={({ pressed }) => [
                      styles.actionButton,
                      styles.primaryAction,
                      pressed ? styles.actionPressed : null,
                    ]}
                  >
                    <Text style={styles.primaryActionText}>
                      {renameListMutation.isPending
                        ? t('shoppingLists.renaming')
                        : t('common.actions.confirm')}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={cancelRename}
                    style={({ pressed }) => [
                      styles.actionButton,
                      styles.secondaryAction,
                      pressed ? styles.actionPressed : null,
                    ]}
                  >
                    <Text style={styles.secondaryActionText}>
                      {t('common.actions.cancel')}
                    </Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <>
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
                <View style={styles.actionRow}>
                  <Pressable
                    onPress={() => startRename(item)}
                    style={({ pressed }) => [
                      styles.actionButton,
                      styles.secondaryAction,
                      pressed ? styles.actionPressed : null,
                    ]}
                  >
                    <Text style={styles.secondaryActionText}>
                      {t('shoppingLists.renameAction')}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => confirmDeleteList(item)}
                    style={({ pressed }) => [
                      styles.actionButton,
                      styles.destructiveAction,
                      pressed ? styles.actionPressed : null,
                    ]}
                  >
                    <Text style={styles.destructiveActionText}>
                      {deleteListMutation.isPending &&
                      deletingListId === item.id
                        ? t('shoppingLists.deleting')
                        : t('shoppingLists.deleteAction')}
                    </Text>
                  </Pressable>
                </View>
              </>
            )}
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
  feedbackError: {
    color: '#b91c1c',
    fontSize: 14,
    lineHeight: 22,
  },
  feedbackSuccess: {
    color: '#166534',
    fontSize: 14,
    lineHeight: 22,
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
