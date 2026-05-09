import type { PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ScreenProps = PropsWithChildren<{
  centered?: boolean;
}>;

export function Screen({ centered = false, children }: ScreenProps) {
  if (typeof children === 'string') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.content, centered && styles.centered]}>
          <Text style={styles.text}>{children}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.content, centered && styles.centered]}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  centered: {
    justifyContent: 'center',
  },
  text: {
    color: '#6b7280',
    fontSize: 14,
    textAlign: 'center',
  },
});
