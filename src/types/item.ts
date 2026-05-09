import type { AppDatabase } from './database';

export type ShoppingItem = AppDatabase['public']['Tables']['items']['Row'];
export type ShoppingItemInsert =
  AppDatabase['public']['Tables']['items']['Insert'];
export type ShoppingItemUpdate =
  AppDatabase['public']['Tables']['items']['Update'];
