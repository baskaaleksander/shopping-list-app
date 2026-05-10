import { getSupabaseClient } from '../../services/supabase';
import type { ShoppingItem, ShoppingItemInsert } from '../../types';

type ItemResult<TData> = {
  data: TData | null;
  errorKey: string | null;
};

export async function fetchShoppingListItems(
  listId: string,
  userId: string,
): Promise<ItemResult<ShoppingItem[]>> {
  const { client, error } = getSupabaseClient();

  if (!client) {
    return {
      data: null,
      errorKey: error,
    };
  }

  const { data, error: queryError } = await client
    .from('items')
    .select(
      'id, user_id, list_id, name, quantity, completed, created_at, updated_at',
    )
    .eq('list_id', listId)
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (queryError) {
    return {
      data: null,
      errorKey: 'common.errors.loadFailed',
    };
  }

  return {
    data: data ?? [],
    errorKey: null,
  };
}

export async function createShoppingItem(
  input: ShoppingItemInsert,
): Promise<ItemResult<ShoppingItem>> {
  const { client, error } = getSupabaseClient();

  if (!client) {
    return {
      data: null,
      errorKey: error,
    };
  }

  const { data, error: insertError } = await client
    .from('items')
    .insert([input])
    .select(
      'id, user_id, list_id, name, quantity, completed, created_at, updated_at',
    )
    .single();

  if (insertError || !data) {
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
