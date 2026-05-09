import { StyleSheet, Text, TextInput, View } from 'react-native';

type AppTextInputProps = {
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  label?: string;
  onChangeText?: (value: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  value?: string;
};

export function AppTextInput({
  autoCapitalize = 'sentences',
  label,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  value,
}: AppTextInputProps) {
  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        autoCapitalize={autoCapitalize}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        secureTextEntry={secureTextEntry}
        style={styles.input}
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderColor: '#d1d5db',
    borderRadius: 12,
    borderWidth: 1,
    color: '#111827',
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  label: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
});
