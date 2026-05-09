import { getSupabaseClient } from '../../services/supabase';
import type { AppDatabase } from '../../types/database';

type AuthResult = {
  errorKey: string | null;
};

function mapAuthError(message: string, fallbackKey: string) {
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes('invalid login credentials')) {
    return 'auth.errors.failedLogin';
  }

  if (normalizedMessage.includes('user already registered')) {
    return 'auth.errors.emailTaken';
  }

  if (normalizedMessage.includes('duplicate key')) {
    return 'auth.errors.usernameTaken';
  }

  return fallbackKey;
}

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<AuthResult> {
  const { client, error } = getSupabaseClient();

  if (!client) {
    return { errorKey: error };
  }

  const { error: signInError } = await client.auth.signInWithPassword({
    email,
    password,
  });

  return {
    errorKey: signInError
      ? mapAuthError(signInError.message, 'auth.errors.failedLogin')
      : null,
  };
}

export async function signUpWithProfile(
  email: string,
  password: string,
  username: string,
): Promise<AuthResult> {
  const { client, error } = getSupabaseClient();

  if (!client) {
    return { errorKey: error };
  }

  const { data, error: signUpError } = await client.auth.signUp({
    email,
    password,
  });

  if (signUpError) {
    return {
      errorKey: mapAuthError(
        signUpError.message,
        'auth.errors.failedRegistration',
      ),
    };
  }

  if (!data.user) {
    return {
      errorKey: 'auth.errors.failedRegistration',
    };
  }

  const profile: AppDatabase['public']['Tables']['profiles']['Insert'] = {
    id: data.user.id,
    username,
  };

  const { error: profileError } = await client
    .from('profiles')
    .insert([profile]);

  if (profileError) {
    await client.auth.signOut();

    return {
      errorKey: mapAuthError(
        profileError.message,
        'auth.errors.failedRegistration',
      ),
    };
  }

  return { errorKey: null };
}
