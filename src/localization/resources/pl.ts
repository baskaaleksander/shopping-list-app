export const pl = {
  auth: {
    emailLabel: 'E-mail',
    errors: {
      emailTaken: 'Konto dla tego adresu e-mail już istnieje.',
      failedLogin:
        'Aplikacja nie mogła zalogować Cię tym adresem e-mail i hasłem.',
      failedRegistration: 'Aplikacja nie mogła utworzyć konta.',
      usernameTaken: 'Ta nazwa użytkownika jest już zajęta.',
    },
    guestHint:
      'Logowanie jest wymagane, zanim jakiekolwiek dane zakupowe będą dostępne.',
    loadingSignIn: 'Logowanie...',
    loadingSignUp: 'Tworzenie konta...',
    nextStep:
      'Ekrany uwierzytelniania i obsługa formularzy zostaną podłączone do tego widoku w następnym zadaniu.',
    passwordLabel: 'Hasło',
    primaryAction: 'Logowanie w następnym kroku',
    signInAction: 'Zaloguj się',
    signInTitle: 'Logowanie',
    signUpAction: 'Utwórz konto',
    signUpTitle: 'Utwórz konto',
    subtitle:
      'Prywatne listy zakupów pozostają za bramką logowania. Przywracanie sesji przez Supabase jest już podłączone.',
    switchToSignIn: 'Masz już konto? Zaloguj się',
    switchToSignUp: 'Potrzebujesz konta? Utwórz je',
    title: 'Witaj ponownie',
    usernameLabel: 'Nazwa użytkownika',
  },
  common: {
    actions: {
      cancel: 'Anuluj',
      confirm: 'Potwierdź',
      delete: 'Usuń',
      save: 'Zapisz',
    },
    errors: {
      deleteFailed: 'Aplikacja nie mogła usunąć wskazanych danych.',
      loadFailed: 'Aplikacja nie mogła wczytać danych z Supabase.',
      network: 'Błąd sieci lub serwera przerwał żądanie.',
      saveFailed: 'Aplikacja nie mogła zapisać zmian.',
      sessionLoad: 'Aplikacja nie mogła przywrócić bieżącej sesji z Supabase.',
      supabaseEnvMissing:
        'Brakuje zmiennych środowiskowych Supabase. Dodaj EXPO_PUBLIC_SUPABASE_URL oraz EXPO_PUBLIC_SUPABASE_ANON_KEY do lokalnego pliku .env.',
    },
    feedback: {
      changesSaved: 'Zmiany zapisane.',
      itemAdded: 'Produkt dodany.',
      itemDeleted: 'Produkt usunięty.',
      itemUpdated: 'Produkt zaktualizowany.',
      listCreated: 'Lista utworzona.',
      listDeleted: 'Lista usunięta.',
      listRenamed: 'Nazwa listy zmieniona.',
    },
  },
  items: {
    addAction: 'Dodaj produkt',
    completedLabel: 'Ukończono',
    deleteAction: 'Usuń produkt',
    editAction: 'Edytuj produkt',
    emptyDescription:
      'Dodaj pierwszy produkt, aby zacząć śledzić postęp zakupów.',
    emptyTitle: 'Brak produktów',
    nameLabel: 'Nazwa produktu',
    quantityLabel: 'Ilość',
  },
  navigation: {
    listDetailTitle: 'Szczegóły listy',
    signInTitle: 'Logowanie',
    signUpTitle: 'Utwórz konto',
    shoppingListsHomeTitle: 'Listy zakupów',
  },
  shell: {
    loadingSession: 'Sprawdzanie lokalnej sesji Supabase...',
  },
  shoppingLists: {
    createAction: 'Utwórz listę',
    createTitle: 'Nowa lista zakupów',
    deleteAction: 'Usuń listę',
    emptyDescription: 'Utwórz listę, aby uporządkować kolejne zakupy.',
    emptyTitle: 'Brak list zakupów',
    noEmail: 'Brak adresu e-mail zalogowanego użytkownika',
    progressLabel: 'Postęp',
    renameAction: 'Zmień nazwę listy',
    signOutAction: 'Wyloguj się',
    subtitle:
      'Uwierzytelniona nawigacja, providery i przywracanie sesji są gotowe do dalszej implementacji funkcji.',
    title: 'Szkielet list zakupów',
  },
  validation: {
    invalidEmail: 'Wpisz poprawny adres e-mail.',
    requiredItemName: 'Nazwa produktu jest wymagana.',
    requiredListName: 'Nazwa listy jest wymagana.',
    requiredUsername: 'Nazwa użytkownika jest wymagana.',
    shortPassword: 'Hasło musi mieć co najmniej 6 znaków.',
  },
} as const;
