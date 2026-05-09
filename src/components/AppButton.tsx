import type { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

type AppButtonProps = PropsWithChildren<{
  disabled?: boolean;
  onPress?: () => void;
  variant?: 'primary' | 'secondary';
}>;

export function AppButton({
  children,
  disabled = false,
  onPress,
  variant = 'primary',
}: AppButtonProps) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' ? styles.primary : styles.secondary,
        disabled && styles.disabled,
        pressed && !disabled ? styles.pressed : null,
      ]}
    >
      <Text
        style={[
          styles.text,
          variant === 'primary' ? styles.primaryText : styles.secondaryText,
        ]}
      >
        {children}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  disabled: {
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.85,
  },
  primary: {
    backgroundColor: '#111827',
  },
  primaryText: {
    color: '#f9fafb',
  },
  secondary: {
    backgroundColor: '#e5e7eb',
  },
  secondaryText: {
    color: '#374151',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});
