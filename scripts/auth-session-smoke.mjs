import { createClient } from '@supabase/supabase-js';

const url = 'http://127.0.0.1:54321';
const anonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

function createAuthClient() {
  return createClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: true,
      storage: storage,
    },
  });
}

function fail(message) {
  throw new Error(message);
}

const storageState = new Map();
const storage = {
  clear: async () => {
    storageState.clear();
  },
  getItem: async (key) => storageState.get(key) ?? null,
  removeItem: async (key) => {
    storageState.delete(key);
  },
  setItem: async (key, value) => {
    storageState.set(key, value);
  },
};

await storage.clear();

const stamp = Date.now();
const email = `session-${stamp}@example.com`;
const password = 'Password123!';

const firstClient = createAuthClient();
const signUp = await firstClient.auth.signUp({ email, password });

if (signUp.error || !signUp.data.session) {
  fail(signUp.error?.message ?? 'Expected sign-up to create a session');
}

const restoredClient = createAuthClient();
const restoredSession = await restoredClient.auth.getSession();

if (!restoredSession.data.session) {
  fail('Expected a persisted session to be restored from storage');
}

const signOut = await restoredClient.auth.signOut();

if (signOut.error) {
  fail(signOut.error.message);
}

const signedOutClient = createAuthClient();
const signedOutSession = await signedOutClient.auth.getSession();

if (signedOutSession.data.session) {
  fail('Expected sign-out to clear the persisted session');
}

console.log('auth session smoke ok');
