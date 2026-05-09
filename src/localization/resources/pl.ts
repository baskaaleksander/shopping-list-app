export const pl = {
  auth: {
    nextStep:
      'Ekrany uwierzytelniania i obsługa formularzy zostaną podłączone do tego widoku w następnym zadaniu.',
    primaryAction: 'Logowanie w następnym kroku',
    subtitle:
      'Prywatne listy zakupów pozostają za bramką logowania. Przywracanie sesji przez Supabase jest już podłączone.',
    title: 'Witaj ponownie',
  },
  common: {
    errors: {
      sessionLoad: 'Aplikacja nie mogła przywrócić bieżącej sesji z Supabase.',
      supabaseEnvMissing:
        'Brakuje zmiennych środowiskowych Supabase. Dodaj EXPO_PUBLIC_SUPABASE_URL oraz EXPO_PUBLIC_SUPABASE_ANON_KEY do lokalnego pliku .env.',
    },
  },
  navigation: {
    authWelcomeTitle: 'Logowanie',
    shoppingListsHomeTitle: 'Listy zakupów',
  },
  shell: {
    loadingSession: 'Sprawdzanie lokalnej sesji Supabase...',
  },
  shoppingLists: {
    noEmail: 'Brak adresu e-mail zalogowanego użytkownika',
    signOutAction: 'Wyloguj się',
    subtitle:
      'Uwierzytelniona nawigacja, providery i przywracanie sesji są gotowe do dalszej implementacji funkcji.',
    title: 'Szkielet list zakupów',
  },
} as const;
