import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

import type { AppDatabase } from '../../types/database';
import { getSupabaseConfig } from './env';

let supabaseClient: ReturnType<typeof createClient<AppDatabase>> | null = null;
let supabaseConfigError: string | null = null;

export function getSupabaseClient() {
  if (supabaseClient || supabaseConfigError) {
    return {
      client: supabaseClient,
      error: supabaseConfigError,
    };
  }

  const config = getSupabaseConfig();

  if (!config) {
    supabaseConfigError = 'common.errors.supabaseEnvMissing';

    return {
      client: null,
      error: supabaseConfigError,
    };
  }

  supabaseClient = createClient<AppDatabase>(config.url, config.anonKey, {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: false,
      persistSession: true,
      storage: AsyncStorage,
    },
  });

  return {
    client: supabaseClient,
    error: null,
  };
}
