import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AppLoader } from '../../components/AppLoader';
import { Screen } from '../../components/Screen';
import { AuthWelcomeScreen } from '../../features/auth';
import { ShoppingListsHomeScreen } from '../../features/shoppingLists';
import { appStrings } from '../../localization/messages';
import { useSession } from '../providers/SessionProvider';
import type { RootStackParamList } from '../../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

function LoadingScreen() {
  return (
    <Screen centered>
      <AppLoader label={appStrings.shell.loadingSession} />
    </Screen>
  );
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
