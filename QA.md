# Manual QA Checklist

## Authentication

- [ ] **Registration**: Users can successfully register a new account.
- [ ] **Login**: Users can log in with valid credentials.
- [ ] **Invalid Login**: System displays appropriate error message for invalid credentials.
- [ ] **Auth Guard**: Unauthenticated users trying to access protected routes are redirected to login.
- [ ] **Logout**: Users can successfully log out and are redirected to the login screen.

## Shopping Lists

- [ ] **Create List**: Users can create a new shopping list.
- [ ] **List Validation**: System prevents creating lists with empty names.
- [ ] **View Lists**: Users can see their created lists.
- [ ] **Delete List**: Users can delete their own lists.

## Shopping Items

- [ ] **Add Item**: Users can add an item to a specific list.
- [ ] **Item Validation**: System prevents adding items with empty names.
- [ ] **Toggle Completion**: Users can toggle an item's completion status.
- [ ] **Optimistic Update**: Item completion toggles instantly on the UI without waiting for server response.
- [ ] **Delete Item**: Users can delete an item.

## Offline/Network Error Handling

- [ ] **Network Errors**: Appropriate error messages are displayed when network requests fail.

## Localization

- [ ] **Fallback**: If a specific translation is missing, the app gracefully falls back to the default language.

# Lista kontrolna QA

## Uwierzytelnianie

- [ ] **Rejestracja**: Uzytkownicy moga pomyslnie zarejestrowac nowe konto.
- [ ] **Logowanie**: Uzytkownicy moga zalogowac sie przy uzyciu poprawnych danych.
- [ ] **Nieprawidlowe logowanie**: System wyswietla odpowiedni komunikat bledu dla niepoprawnych danych logowania.
- [ ] **Ochrona tras**: Niezalogowani uzytkownicy probujacy uzyskac dostep do chronionych tras sa przekierowywani do logowania.
- [ ] **Wylogowanie**: Uzytkownicy moga pomyslnie sie wylogowac i zostaja przekierowani do ekranu logowania.

## Listy zakupow

- [ ] **Tworzenie listy**: Uzytkownicy moga utworzyc nowa liste zakupow.
- [ ] **Walidacja listy**: System uniemozliwia tworzenie list z pusta nazwa.
- [ ] **Widok list**: Uzytkownicy moga zobaczyc swoje utworzone listy.
- [ ] **Usuwanie listy**: Uzytkownicy moga usuwac swoje listy.

## Produkty na liscie

- [ ] **Dodawanie produktu**: Uzytkownicy moga dodac produkt do konkretnej listy.
- [ ] **Walidacja produktu**: System uniemozliwia dodawanie produktow z pusta nazwa.
- [ ] **Zmiana statusu**: Uzytkownicy moga zmieniac status ukonczenia produktu.
- [ ] **Optymistyczna aktualizacja**: Zmiana statusu produktu jest widoczna natychmiast w interfejsie bez czekania na odpowiedz serwera.
- [ ] **Usuwanie produktu**: Uzytkownicy moga usuwac produkt.

## Obsluga trybu offline / bledow sieciowych

- [ ] **Bledy sieciowe**: Odpowiednie komunikaty o bledach sa wyswietlane, gdy zadania sieciowe koncza sie niepowodzeniem.

## Lokalizacja

- [ ] **Fallback**: Jesli brakuje konkretnego tlumaczenia, aplikacja poprawnie korzysta z domyslnego jezyka.
