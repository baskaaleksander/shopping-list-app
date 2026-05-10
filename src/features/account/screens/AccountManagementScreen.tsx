import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../types';
import { FlatList, StyleSheet, View, Text } from 'react-native';
import { Screen } from '../../../components/Screen';


type Props = NativeStackScreenProps<RootStackParamList, 'AccountManagement'>;

export function AccountManagementScreen({ navigation }: Props) {
  return <Screen>
    <View>
      <Text>AccountManagement Screen</Text>
    </View>
  </Screen>;
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
    paddingBottom: 24,
  },
});