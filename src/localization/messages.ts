export const appStrings = {
  auth: {
    nextStep:
      'Authentication screens and form handling will connect to this guest shell in the next task.',
    primaryAction: 'Sign in coming next',
    subtitle:
      'Private shopping lists stay behind the auth gate. Session bootstrap is already wired through Supabase.',
    title: 'Welcome back',
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
