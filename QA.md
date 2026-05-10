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
