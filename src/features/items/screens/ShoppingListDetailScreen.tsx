import { useState } from 'react';
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

import {
  createShoppingItem,
  deleteShoppingItem,
  fetchShoppingListItems,
  updateShoppingItem,
} from '../api';

type Props = NativeStackScreenProps<RootStackParamList, 'ShoppingListDetail'>;

export function ShoppingListDetailScreen({ route }: Props) {
  const { session } = useSession();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [draftName, setDraftName] = useState('');
  const [draftQuantity, setDraftQuantity] = useState('');
  const [createErrorKey, setCreateErrorKey] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editQuantity, setEditQuantity] = useState('');
  const [editErrorKey, setEditErrorKey] = useState<string | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
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

  const createItemMutation = useMutation({
    mutationFn: async ({
      name,
      quantity,
    }: {
      name: string;
      quantity: number;
    }) => {
      if (!user?.id) {
        throw new Error('common.errors.saveFailed');
      }

      const result = await createShoppingItem({
        list_id: route.params.listId,
        name,
        quantity,
        user_id: user.id,
      });

      if (result.errorKey || !result.data) {
        throw new Error(result.errorKey ?? 'common.errors.saveFailed');
      }

      return result.data;
    },
    onSuccess: (newItem) => {
      queryClient.setQueryData(
        ['shopping-list-items', user?.id, route.params.listId],
        (currentItems: typeof itemsQuery.data) => {
          const existingItems = currentItems ?? [];

          return [...existingItems, newItem];
        },
      );
      setDraftName('');
      setDraftQuantity('');
      setCreateErrorKey(null);
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({
      itemId,
      name,
      quantity,
    }: {
      itemId: string;
      name: string;
      quantity: number;
    }) => {
      if (!user?.id) {
        throw new Error('common.errors.saveFailed');
      }

      const result = await updateShoppingItem(itemId, user.id, {
        name,
        quantity,
      });

      if (result.errorKey || !result.data) {
        throw new Error(result.errorKey ?? 'common.errors.saveFailed');
      }

      return result.data;
    },
    onSuccess: (updatedItem) => {
      queryClient.setQueryData(
        ['shopping-list-items', user?.id, route.params.listId],
        (currentItems: typeof itemsQuery.data) => {
          const existingItems = currentItems ?? [];

          return existingItems.map((item) =>
            item.id === updatedItem.id ? updatedItem : item,
          );
        },
      );
      setEditingItemId(null);
      setEditName('');
      setEditQuantity('');
      setEditErrorKey(null);
    },
  });

  const toggleItemMutation = useMutation({
    mutationFn: async ({
      completed,
      itemId,
    }: {
      completed: boolean;
      itemId: string;
    }) => {
      if (!user?.id) {
        throw new Error('common.errors.saveFailed');
      }

      const result = await updateShoppingItem(itemId, user.id, { completed });

      if (result.errorKey || !result.data) {
        throw new Error(result.errorKey ?? 'common.errors.saveFailed');
      }

      return result.data;
    },
    onMutate: async ({ completed, itemId }) => {
      const queryKey = [
        'shopping-list-items',
        user?.id,
        route.params.listId,
      ] as const;

      await queryClient.cancelQueries({ queryKey });

      const previousItems =
        queryClient.getQueryData<typeof itemsQuery.data>(queryKey);

      queryClient.setQueryData(
        queryKey,
        (currentItems: typeof itemsQuery.data) => {
          const existingItems = currentItems ?? [];

          return existingItems.map((item) =>
            item.id === itemId ? { ...item, completed } : item,
          );
        },
      );

      return { previousItems, queryKey };
    },
    onError: (_error, _variables, context) => {
      if (!context) {
        return;
      }

      queryClient.setQueryData(context.queryKey, context.previousItems);
    },
    onSuccess: (updatedItem) => {
      queryClient.setQueryData(
        ['shopping-list-items', user?.id, route.params.listId],
        (currentItems: typeof itemsQuery.data) => {
          const existingItems = currentItems ?? [];

          return existingItems.map((item) =>
            item.id === updatedItem.id ? updatedItem : item,
          );
        },
      );
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      if (!user?.id) {
        throw new Error('common.errors.deleteFailed');
      }

      const result = await deleteShoppingItem(itemId, user.id);

      if (result.errorKey) {
        throw new Error(result.errorKey);
      }
    },
    onMutate: async (itemId) => {
      const queryKey = [
        'shopping-list-items',
        user?.id,
        route.params.listId,
      ] as const;

      await queryClient.cancelQueries({ queryKey });

      const previousItems =
        queryClient.getQueryData<typeof itemsQuery.data>(queryKey);

      queryClient.setQueryData(
        queryKey,
        (currentItems: typeof itemsQuery.data) => {
          const existingItems = currentItems ?? [];

          return existingItems.filter((item) => item.id !== itemId);
        },
      );

      return { itemId, previousItems, queryKey };
    },
    onError: (_error, _variables, context) => {
      if (!context) {
        return;
      }

      queryClient.setQueryData(context.queryKey, context.previousItems);
    },
    onSuccess: (_data, deletedItemId) => {
      if (editingItemId === deletedItemId) {
        cancelEditingItem();
      }
    },
    onSettled: () => {
      setDeletingItemId(null);
    },
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

  async function handleCreateItem() {
    const trimmedName = draftName.trim();

    if (!trimmedName) {
      setCreateErrorKey('validation.requiredItemName');
      return;
    }

    const parsedQuantity = draftQuantity.trim()
      ? Number.parseInt(draftQuantity.trim(), 10)
      : 1;

    if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
      setCreateErrorKey('validation.invalidQuantity');
      return;
    }

    setCreateErrorKey(null);

    try {
      await createItemMutation.mutateAsync({
        name: trimmedName,
        quantity: parsedQuantity,
      });
    } catch (error) {
      setCreateErrorKey(
        error instanceof Error ? error.message : 'common.errors.saveFailed',
      );
    }
  }

  function startEditingItem(itemId: string, name: string, quantity: number) {
    setEditingItemId(itemId);
    setEditName(name);
    setEditQuantity(String(quantity));
    setEditErrorKey(null);
  }

  function cancelEditingItem() {
    setEditingItemId(null);
    setEditName('');
    setEditQuantity('');
    setEditErrorKey(null);
  }

  async function handleUpdateItem(itemId: string) {
    const trimmedName = editName.trim();

    if (!trimmedName) {
      setEditErrorKey('validation.requiredItemName');
      return;
    }

    const parsedQuantity = editQuantity.trim()
      ? Number.parseInt(editQuantity.trim(), 10)
      : 1;

    if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
      setEditErrorKey('validation.invalidQuantity');
      return;
    }

    setEditErrorKey(null);

    try {
      await updateItemMutation.mutateAsync({
        itemId,
        name: trimmedName,
        quantity: parsedQuantity,
      });
    } catch (error) {
      setEditErrorKey(
        error instanceof Error ? error.message : 'common.errors.saveFailed',
      );
    }
  }

  function toggleItemCompletion(itemId: string, completed: boolean) {
    void toggleItemMutation.mutateAsync({
      completed,
      itemId,
    });
  }

  function confirmDeleteItem(itemId: string, itemName: string) {
    Alert.alert(
      t('items.confirmDeleteTitle'),
      t('items.confirmDeleteMessage', { name: itemName }),
      [
        {
          style: 'cancel',
          text: t('common.actions.cancel'),
        },
        {
          onPress: () => {
            setDeletingItemId(itemId);
            deleteItemMutation.mutate(itemId);
          },
          style: 'destructive',
          text: t('items.deleteAction'),
        },
      ],
    );
  }

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
          <View style={styles.headerStack}>
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
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>{t('items.addAction')}</Text>
              <AppTextInput
                label={t('items.nameLabel')}
                onChangeText={setDraftName}
                placeholder={t('items.namePlaceholder')}
                value={draftName}
              />
              <AppTextInput
                keyboardType="number-pad"
                label={t('items.quantityLabel')}
                onChangeText={setDraftQuantity}
                placeholder={t('items.quantityPlaceholder')}
                value={draftQuantity}
              />
              <Text style={styles.hint}>{t('items.defaultQuantityHint')}</Text>
              {createErrorKey ? (
                <Text style={styles.error}>{t(createErrorKey)}</Text>
              ) : null}
              <AppButton
                disabled={createItemMutation.isPending}
                onPress={() => void handleCreateItem()}
              >
                {createItemMutation.isPending
                  ? t('items.creating')
                  : t('items.addAction')}
              </AppButton>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View
            style={[styles.card, item.completed ? styles.completedCard : null]}
          >
            {editingItemId === item.id ? (
              <View style={styles.formStack}>
                <Text style={styles.formTitle}>{t('items.editAction')}</Text>
                <AppTextInput
                  label={t('items.nameLabel')}
                  onChangeText={setEditName}
                  placeholder={t('items.namePlaceholder')}
                  value={editName}
                />
                <AppTextInput
                  keyboardType="number-pad"
                  label={t('items.quantityLabel')}
                  onChangeText={setEditQuantity}
                  placeholder={t('items.quantityPlaceholder')}
                  value={editQuantity}
                />
                {editErrorKey ? (
                  <Text style={styles.error}>{t(editErrorKey)}</Text>
                ) : null}
                <View style={styles.actionRow}>
                  <Pressable
                    onPress={() => void handleUpdateItem(item.id)}
                    style={({ pressed }) => [
                      styles.actionButton,
                      styles.primaryAction,
                      pressed ? styles.actionPressed : null,
                    ]}
                  >
                    <Text style={styles.primaryActionText}>
                      {updateItemMutation.isPending
                        ? t('items.updating')
                        : t('common.actions.save')}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={cancelEditingItem}
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
                <View style={styles.actionRow}>
                  <Pressable
                    onPress={() =>
                      toggleItemCompletion(item.id, !item.completed)
                    }
                    style={({ pressed }) => [
                      styles.actionButton,
                      item.completed
                        ? styles.secondaryAction
                        : styles.primaryAction,
                      pressed ? styles.actionPressed : null,
                    ]}
                  >
                    <Text
                      style={
                        item.completed
                          ? styles.secondaryActionText
                          : styles.primaryActionText
                      }
                    >
                      {item.completed
                        ? t('items.markPendingAction')
                        : t('items.markCompletedAction')}
                    </Text>
                  </Pressable>
                </View>
                <Pressable
                  onPress={() =>
                    startEditingItem(item.id, item.name, item.quantity)
                  }
                  style={({ pressed }) => [
                    styles.linkButton,
                    pressed ? styles.actionPressed : null,
                  ]}
                >
                  <Text style={styles.linkButtonText}>
                    {t('items.editAction')}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => confirmDeleteItem(item.id, item.name)}
                  style={({ pressed }) => [
                    styles.linkDeleteButton,
                    pressed ? styles.actionPressed : null,
                  ]}
                >
                  <Text style={styles.linkDeleteButtonText}>
                    {deleteItemMutation.isPending && deletingItemId === item.id
                      ? t('items.deleting')
                      : t('items.deleteAction')}
                  </Text>
                </Pressable>
              </>
            )}
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
  error: {
    color: '#b91c1c',
    fontSize: 14,
    lineHeight: 22,
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    borderRadius: 20,
    borderWidth: 1,
    gap: 12,
    padding: 18,
  },
  formTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '700',
  },
  formStack: {
    gap: 12,
  },
  headerStack: {
    gap: 12,
  },
  hint: {
    color: '#6b7280',
    fontSize: 13,
    lineHeight: 20,
  },
  actionButton: {
    alignItems: 'center',
    borderRadius: 12,
    flex: 1,
    justifyContent: 'center',
    minHeight: 44,
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
  linkButton: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  linkButtonText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '600',
  },
  linkDeleteButton: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  linkDeleteButtonText: {
    color: '#b91c1c',
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
