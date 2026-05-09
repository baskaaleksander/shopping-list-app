export const en = {
  auth: {
    nextStep:
      'Authentication screens and form handling will connect to this guest shell in the next task.',
    primaryAction: 'Sign in coming next',
    subtitle:
      'Private shopping lists stay behind the auth gate. Session bootstrap is already wired through Supabase.',
    title: 'Welcome back',
  },
  common: {
    errors: {
      sessionLoad:
        'The app could not restore the current session from Supabase.',
      supabaseEnvMissing:
        'Supabase environment variables are missing. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to a local .env file.',
    },
  },
  navigation: {
    authWelcomeTitle: 'Sign in',
    shoppingListsHomeTitle: 'Shopping lists',
  },
  shell: {
    loadingSession: 'Checking your local Supabase session...',
  },
  shoppingLists: {
    noEmail: 'Signed-in email unavailable',
    signOutAction: 'Sign out',
    subtitle:
      'Authenticated navigation, providers, and session restore are ready for feature implementation.',
    title: 'Shopping list shell',
  },
} as const;
