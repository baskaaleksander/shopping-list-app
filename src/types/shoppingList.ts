import type { AppDatabase } from './database';

export type ShoppingList =
  AppDatabase['public']['Tables']['shopping_lists']['Row'];
export type ShoppingListInsert =
  AppDatabase['public']['Tables']['shopping_lists']['Insert'];
export type ShoppingListUpdate =
  AppDatabase['public']['Tables']['shopping_lists']['Update'];
