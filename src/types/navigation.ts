export type RootStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  ShoppingListsHome: undefined;
  ShoppingListDetail: {
    listId: string;
    listName: string;
  };
};
