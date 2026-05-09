import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

type AppLoaderProps = {
  label?: string;
};

export function AppLoader({ label }: AppLoaderProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator color="#111827" size="small" />
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 12,
    justifyContent: 'center',
  },
  label: {
    color: '#6b7280',
    fontSize: 14,
    textAlign: 'center',
  },
});
