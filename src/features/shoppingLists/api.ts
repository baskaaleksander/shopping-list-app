import { getSupabaseClient } from '../../services/supabase';
import type {
  ShoppingItem,
  ShoppingList,
  ShoppingListInsert,
  ShoppingListUpdate,
} from '../../types';

type ShoppingListWithItemsRow = ShoppingList & {
  items: Pick<ShoppingItem, 'completed' | 'id'>[] | null;
};

export type ShoppingListSummary = ShoppingList & {
  completedCount: number;
  itemCount: number;
};

type ShoppingListResult<TData> = {
  data: TData | null;
  errorKey: string | null;
};

function toShoppingListSummary(
  list: ShoppingListWithItemsRow,
): ShoppingListSummary {
  const items = list.items ?? [];

  return {
    ...list,
    completedCount: items.filter((item) => item.completed).length,
    itemCount: items.length,
  };
}

export async function fetchShoppingLists(
  userId: string,
): Promise<ShoppingListResult<ShoppingListSummary[]>> {
  const { client, error } = getSupabaseClient();

  if (!client) {
    return {
      data: null,
      errorKey: error,
    };
  }

  const { data, error: queryError } = await client
    .from('shopping_lists')
    .select('id, user_id, name, created_at, updated_at, items(id, completed)')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (queryError) {
    return {
      data: null,
      errorKey: 'common.errors.loadFailed',
    };
  }

  return {
    data: ((data ?? []) as ShoppingListWithItemsRow[]).map(
      toShoppingListSummary,
    ),
    errorKey: null,
  };
}

export async function createShoppingList(
  input: ShoppingListInsert,
): Promise<ShoppingListResult<ShoppingListSummary>> {
  const { client, error } = getSupabaseClient();

  if (!client) {
    return {
      data: null,
      errorKey: error,
    };
  }

  const { data, error: insertError } = await client
    .from('shopping_lists')
    .insert([input])
    .select('id, user_id, name, created_at, updated_at')
    .single();

  if (insertError || !data) {
    return {
      data: null,
      errorKey: 'common.errors.saveFailed',
    };
  }

  return {
    data: {
      ...data,
      completedCount: 0,
      itemCount: 0,
    },
    errorKey: null,
  };
}

export async function renameShoppingList(
  listId: string,
  userId: string,
  input: Pick<ShoppingListUpdate, 'name'>,
): Promise<ShoppingListResult<ShoppingList>> {
  const { client, error } = getSupabaseClient();

  if (!client) {
    return {
      data: null,
      errorKey: error,
    };
  }

  const { data, error: updateError } = await client
    .from('shopping_lists')
    .update(input)
    .eq('id', listId)
    .eq('user_id', userId)
    .select('id, user_id, name, created_at, updated_at')
    .single();

  if (updateError || !data) {
    return {
      data: null,
      errorKey: 'common.errors.saveFailed',
    };
  }

  return {
    data,
    errorKey: null,
  };
}
