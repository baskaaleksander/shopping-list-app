import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';
import mockSafeAreaContext from 'react-native-safe-area-context/jest/mock';

import 'react-native-gesture-handler/jestSetup';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);
jest.mock('expo-localization', () => ({
  getLocales: () => [{ languageCode: 'en', languageTag: 'en-US' }],
}));
jest.mock('react-native-safe-area-context', () => mockSafeAreaContext);
