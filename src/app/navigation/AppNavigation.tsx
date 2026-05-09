import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { AppLoader } from '../../components/AppLoader';
import { Screen } from '../../components/Screen';
import { SignInScreen, SignUpScreen } from '../../features/auth';
import { ShoppingListsHomeScreen } from '../../features/shoppingLists';
import { useSession } from '../providers/SessionProvider';
import type { RootStackParamList } from '../../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

function LoadingScreen() {
  const { t } = useTranslation();

  return (
    <Screen centered>
      <AppLoader label={t('shell.loadingSession')} />
    </Screen>
  );
}

export function AppNavigation() {
  const { session, status } = useSession();
  const { t } = useTranslation();

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
            options={{ title: t('navigation.shoppingListsHomeTitle') }}
          />
        ) : (
          <>
            <Stack.Screen
              component={SignInScreen}
              name="SignIn"
              options={{ title: t('navigation.signInTitle') }}
            />
            <Stack.Screen
              component={SignUpScreen}
              name="SignUp"
              options={{ title: t('navigation.signUpTitle') }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
