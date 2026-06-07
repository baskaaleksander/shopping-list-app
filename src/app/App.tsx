import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import '../localization/i18n';

import { AppNavigation } from './navigation/AppNavigation';
import { QueryProvider } from './providers/QueryProvider';
import { SessionProvider } from './providers/SessionProvider';
import { ToastProvider } from './providers/ToastProvider';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryProvider>
          <SessionProvider>
            <ToastProvider>
              <StatusBar style="auto" />
              <AppNavigation />
            </ToastProvider>
          </SessionProvider>
        </QueryProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
