import type { PropsWithChildren, ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

type AppDialogProps = PropsWithChildren<{
  actions: ReactNode;
  message?: string;
  onRequestClose: () => void;
  title: string;
  visible: boolean;
}>;

export function AppDialog({
  actions,
  children,
  message,
  onRequestClose,
  title,
  visible,
}: AppDialogProps) {
  return (
    <Modal
      animationType="fade"
      onRequestClose={onRequestClose}
      transparent
      visible={visible}
    >
      <Pressable style={styles.backdrop} onPress={onRequestClose}>
        <Pressable style={styles.card} onPress={() => undefined}>
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          {children}
          <View style={styles.actions}>{actions}</View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  backdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(17, 24, 39, 0.45)',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    gap: 12,
    padding: 20,
    width: '100%',
  },
  message: {
    color: '#4b5563',
    fontSize: 14,
    lineHeight: 22,
  },
  title: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '700',
  },
});
