import { StyleSheet, Text, View } from 'react-native';

type EmptyStateProps = {
  description: string;
  title: string;
};

export function EmptyState({ description, title }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
    paddingVertical: 12,
  },
  description: {
    color: '#6b7280',
    fontSize: 14,
    lineHeight: 22,
  },
  title: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '700',
  },
});
