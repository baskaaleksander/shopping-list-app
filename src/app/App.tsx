import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import '../localization/i18n';

import { AppNavigation } from './navigation/AppNavigation';
import { LocalizationProvider } from './providers/LocalizationProvider';
import { QueryProvider } from './providers/QueryProvider';
import { SessionProvider } from './providers/SessionProvider';
import { ToastProvider } from './providers/ToastProvider';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryProvider>
          <LocalizationProvider>
            <SessionProvider>
              <ToastProvider>
                <StatusBar style="auto" />
                <AppNavigation />
              </ToastProvider>
            </SessionProvider>
          </LocalizationProvider>
        </QueryProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
