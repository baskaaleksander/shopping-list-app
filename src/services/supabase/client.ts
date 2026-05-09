import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

import { getSupabaseConfig } from './env';

let supabaseClient: ReturnType<typeof createClient> | null = null;
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
    supabaseConfigError =
      'Supabase environment variables are missing. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to a local .env file.';

    return {
      client: null,
      error: supabaseConfigError,
    };
  }

  supabaseClient = createClient(config.url, config.anonKey, {
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
