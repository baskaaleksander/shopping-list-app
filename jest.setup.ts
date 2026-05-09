import mockSafeAreaContext from 'react-native-safe-area-context/jest/mock';

import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native-safe-area-context', () => mockSafeAreaContext);
