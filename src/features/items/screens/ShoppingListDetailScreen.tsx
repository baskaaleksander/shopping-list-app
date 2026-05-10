import { useEffect, useState } from 'react';
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

import { AppDialog } from '../../../components/AppDialog';
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
  const [deletingItem, setDeletingItem] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [editErrorKey, setEditErrorKey] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editQuantity, setEditQuantity] = useState('');
  const [editingItem, setEditingItem] = useState<{
    id: string;
  } | null>(null);
  const [isCreateDialogVisible, setCreateDialogVisible] = useState(false);
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
      setCreateDialogVisible(false);
      Alert.alert(
        t('common.feedback.successTitle'),
        t('common.feedback.itemAdded'),
      );
      void queryClient.invalidateQueries({
        queryKey: ['shopping-lists', user?.id],
      });
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
      closeEditItemDialog(true);
      Alert.alert(
        t('common.feedback.successTitle'),
        t('common.feedback.itemUpdated'),
      );
      void queryClient.invalidateQueries({
        queryKey: ['shopping-lists', user?.id],
      });
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
      Alert.alert(
        t('common.feedback.errorTitle'),
        t('common.errors.deleteFailed'),
      );
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
      void queryClient.invalidateQueries({
        queryKey: ['shopping-lists', user?.id],
      });
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
      setDeletingItem(null);
      Alert.alert(
        t('common.feedback.errorTitle'),
        t('common.errors.deleteFailed'),
      );
    },
    onSuccess: () => {
      setDeletingItem(null);
      Alert.alert(
        t('common.feedback.successTitle'),
        t('common.feedback.itemDeleted'),
      );
      void queryClient.invalidateQueries({
        queryKey: ['shopping-lists', user?.id],
      });
    },
  });

  useEffect(() => {
    if (itemsQuery.error) {
      Alert.alert(
        t('common.feedback.errorTitle'),
        t('common.errors.loadFailed'),
      );
    }
  }, [itemsQuery.error, t]);

  if (itemsQuery.isPending) {
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

  function openCreateItemDialog() {
    setDraftName('');
    setDraftQuantity('');
    setCreateErrorKey(null);
    setCreateDialogVisible(true);
  }

  function closeCreateItemDialog() {
    if (createItemMutation.isPending) {
      return;
    }

    setCreateDialogVisible(false);
    setDraftName('');
    setDraftQuantity('');
    setCreateErrorKey(null);
  }

  function closeDeleteItemDialog() {
    if (deleteItemMutation.isPending) {
      return;
    }

    setDeletingItem(null);
  }

  function closeEditItemDialog(force = false) {
    if (!force && updateItemMutation.isPending) {
      return;
    }

    setEditingItem(null);
    setEditErrorKey(null);
    setEditName('');
    setEditQuantity('');
  }

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
      Alert.alert(
        t('common.feedback.errorTitle'),
        t(error instanceof Error ? error.message : 'common.errors.saveFailed'),
      );
    }
  }

  async function handleUpdateItem(
    itemId: string,
    newName: string,
    newQuantity: string,
  ) {
    const trimmedName = newName.trim();

    if (!trimmedName) {
      setEditErrorKey('validation.requiredItemName');
      return;
    }

    const parsedQuantity = newQuantity.trim()
      ? Number.parseInt(newQuantity.trim(), 10)
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
      Alert.alert(
        t('common.feedback.errorTitle'),
        t(error instanceof Error ? error.message : 'common.errors.saveFailed'),
      );
    }
  }

  function startEditingItem(itemId: string, name: string, quantity: number) {
    setEditingItem({ id: itemId });
    setEditName(name);
    setEditQuantity(String(quantity));
    setEditErrorKey(null);
  }

  function toggleItemCompletion(itemId: string, completed: boolean) {
    void toggleItemMutation.mutateAsync({
      completed,
      itemId,
    });
  }

  function confirmDeleteItem(itemId: string, itemName: string) {
    setDeletingItem({ id: itemId, name: itemName });
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
          </View>
        }
        renderItem={({ item }) => (
          <View
            style={[styles.card, item.completed ? styles.completedCard : null]}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleContainer}>
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
              </View>
              <View style={styles.cardActions}>
                <Pressable
                  onPress={() =>
                    startEditingItem(item.id, item.name, item.quantity)
                  }
                  style={({ pressed }) => [
                    styles.iconButton,
                    pressed ? styles.actionPressed : null,
                  ]}
                  accessibilityLabel={t('items.editAction')}
                >
                  <Feather name="edit-2" size={20} color="#374151" />
                </Pressable>
                <Pressable
                  onPress={() => confirmDeleteItem(item.id, item.name)}
                  style={({ pressed }) => [
                    styles.iconButton,
                    pressed ? styles.actionPressed : null,
                  ]}
                  accessibilityLabel={t('items.deleteAction')}
                >
                  <Feather name="trash-2" size={20} color="#b91c1c" />
                </Pressable>
              </View>
            </View>
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
                onPress={() => toggleItemCompletion(item.id, !item.completed)}
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
          </View>
        )}
      />
      <Pressable
        accessibilityLabel={t('items.addAction')}
        onPress={openCreateItemDialog}
        style={({ pressed }) => [
          styles.fab,
          pressed ? styles.actionPressed : null,
        ]}
      >
        <Feather name="plus" size={24} color="#ffffff" />
      </Pressable>
      <AppDialog
        actions={
          <>
            <AppButton
              disabled={createItemMutation.isPending}
              onPress={closeCreateItemDialog}
              variant="secondary"
            >
              {t('common.actions.cancel')}
            </AppButton>
            <AppButton
              disabled={createItemMutation.isPending}
              onPress={() => void handleCreateItem()}
            >
              {createItemMutation.isPending
                ? t('items.creating')
                : t('common.actions.confirm')}
            </AppButton>
          </>
        }
        onRequestClose={closeCreateItemDialog}
        title={t('items.addAction')}
        visible={isCreateDialogVisible}
      >
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
      </AppDialog>
      <AppDialog
        actions={
          <>
            <AppButton
              disabled={updateItemMutation.isPending}
              onPress={closeEditItemDialog}
              variant="secondary"
            >
              {t('common.actions.cancel')}
            </AppButton>
            <AppButton
              disabled={updateItemMutation.isPending}
              onPress={() =>
                editingItem
                  ? void handleUpdateItem(
                      editingItem.id,
                      editName,
                      editQuantity,
                    )
                  : undefined
              }
            >
              {updateItemMutation.isPending
                ? t('items.updating')
                : t('common.actions.confirm')}
            </AppButton>
          </>
        }
        onRequestClose={closeEditItemDialog}
        title={t('items.editAction')}
        visible={Boolean(editingItem)}
      >
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
        <Text style={styles.hint}>{t('items.defaultQuantityHint')}</Text>
        {editErrorKey ? (
          <Text style={styles.error}>{t(editErrorKey)}</Text>
        ) : null}
      </AppDialog>
      <AppDialog
        actions={
          <>
            <AppButton
              disabled={deleteItemMutation.isPending}
              onPress={closeDeleteItemDialog}
              variant="secondary"
            >
              {t('common.actions.cancel')}
            </AppButton>
            <AppButton
              disabled={deleteItemMutation.isPending}
              onPress={() =>
                deletingItem
                  ? deleteItemMutation.mutate(deletingItem.id)
                  : undefined
              }
            >
              {deleteItemMutation.isPending
                ? t('items.deleting')
                : t('items.deleteAction')}
            </AppButton>
          </>
        }
        message={
          deletingItem
            ? `${t('items.confirmDeleteMessage', { name: deletingItem.name })}\n\n${t('shoppingLists.actionCannotBeUndone')}`
            : undefined
        }
        onRequestClose={closeDeleteItemDialog}
        title={t('items.confirmDeleteTitle')}
        visible={Boolean(deletingItem)}
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitleContainer: {
    flex: 1,
    marginRight: 8,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 4,
  },
  content: {
    gap: 12,
    paddingBottom: 96,
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
  fab: {
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 28,
    bottom: 24,
    elevation: 5,
    height: 56,
    justifyContent: 'center',
    position: 'absolute',
    right: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    width: 56,
  },
  error: {
    color: '#b91c1c',
    fontSize: 14,
    lineHeight: 22,
  },
  formTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '700',
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
