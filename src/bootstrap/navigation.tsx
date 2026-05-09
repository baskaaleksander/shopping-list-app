import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '../components/Screen';
import { appStrings } from '../localization/messages';
import type { RootStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

function HomeScreen() {
  return (
    <Screen>
      <View style={styles.content}>
        <Text style={styles.title}>{appStrings.shell.title}</Text>
        <Text style={styles.subtitle}>{appStrings.shell.subtitle}</Text>
        <Text style={styles.status}>{appStrings.shell.statusMessage}</Text>
      </View>
    </Screen>
  );
}

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          component={HomeScreen}
          name="Home"
          options={{ title: appStrings.navigation.homeTitle }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
  },
  status: {
    fontSize: 14,
    color: '#6b7280',
  },
});
