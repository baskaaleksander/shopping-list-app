import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthWelcomeScreen } from '../../features/auth/screens/AuthWelcomeScreen';
import { ShoppingListsHomeScreen } from '../../features/shoppingLists/screens/ShoppingListsHomeScreen';
import { appStrings } from '../../localization/messages';
import { Screen } from '../../components/Screen';
import { useSession } from '../providers/SessionProvider';
import type { RootStackParamList } from '../../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

function LoadingScreen() {
  return <Screen centered>{appStrings.shell.loadingSession}</Screen>;
}

export function AppNavigation() {
  const { session, status } = useSession();

  if (status === 'loading') {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {session ? (
          <Stack.Screen
            component={ShoppingListsHomeScreen}
            name="ShoppingListsHome"
            options={{ title: appStrings.navigation.shoppingListsHomeTitle }}
          />
        ) : (
          <Stack.Screen
            component={AuthWelcomeScreen}
            name="AuthWelcome"
            options={{ title: appStrings.navigation.authWelcomeTitle }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
