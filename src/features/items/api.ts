import { getSupabaseClient } from '../../services/supabase';
import type {
  ShoppingItem,
  ShoppingItemInsert,
  ShoppingItemUpdate,
} from '../../types';

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

export async function updateShoppingItem(
  itemId: string,
  userId: string,
  input: Pick<ShoppingItemUpdate, 'completed' | 'name' | 'quantity'>,
): Promise<ItemResult<ShoppingItem>> {
  const { client, error } = getSupabaseClient();

  if (!client) {
    return {
      data: null,
      errorKey: error,
    };
  }

  const { data, error: updateError } = await client
    .from('items')
    .update(input)
    .eq('id', itemId)
    .eq('user_id', userId)
    .select(
      'id, user_id, list_id, name, quantity, completed, created_at, updated_at',
    )
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

export async function deleteShoppingItem(
  itemId: string,
  userId: string,
): Promise<ItemResult<null>> {
  const { client, error } = getSupabaseClient();

  if (!client) {
    return {
      data: null,
      errorKey: error,
    };
  }

  const { error: deleteError } = await client
    .from('items')
    .delete()
    .eq('id', itemId)
    .eq('user_id', userId);

  if (deleteError) {
    return {
      data: null,
      errorKey: 'common.errors.deleteFailed',
    };
  }

  return {
    data: null,
    errorKey: null,
  };
}
