// Form Input Components
import React, { CSSProperties, memo } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, TextInputProps, DimensionValue } from 'react-native';
import { Colors } from '@/src/constants/colors';
import { scale, spacing } from '@/src/utils';

// Input Field Component
interface InputFieldProps extends TextInputProps {
  label: string;
  error?: string;
  hint?: string;
}

export const InputField = memo<InputFieldProps>(({
  label,
  error,
  hint,
  style,
  ...props
}) => (
  <View style={styles.inputGroup}>
    <Text style={[styles.label, error && styles.labelError]} numberOfLines={2}>
      {label}
    </Text>
    <TextInput
      style={[styles.input, error && styles.inputError, style]}
      placeholderTextColor={Colors.dark.textTertiary}
      {...props}
    />
    {error ? (
      <Text style={styles.errorText}>{error}</Text>
    ) : hint ? (
      <Text style={styles.hint}>{hint}</Text>
    ) : null}
  </View>
));

// Password Input Component
interface PasswordInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  error?: string;
  showPassword: boolean;
  onToggleVisibility: () => void;
}

export const PasswordInput = memo<PasswordInputProps>(({
  label,
  placeholder,
  value,
  onChangeText,
  onBlur,
  error,
  showPassword,
  onToggleVisibility,
}) => (
  <View style={styles.inputGroup}>
    <Text style={[styles.label, error && styles.labelError]} numberOfLines={2}>
      {label}
    </Text>
    <View style={styles.passwordContainer}>
      <TextInput
        style={[styles.input, styles.passwordInput, error && styles.inputError]}
        placeholder={placeholder}
        placeholderTextColor={Colors.dark.textTertiary}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        secureTextEntry={!showPassword}
        autoCapitalize="none"
      />
      <TouchableOpacity style={styles.eyeButton} onPress={onToggleVisibility}>
        <Text style={styles.eyeText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
      </TouchableOpacity>
    </View>
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
));

// Checkbox Component
interface CheckboxProps {
  checked: boolean;
  onToggle: () => void;
  label: React.ReactNode;
  widthCheckbox?: DimensionValue;
}

export const Checkbox = memo<CheckboxProps>(({ checked, onToggle, label, widthCheckbox = null }) => (
  <TouchableOpacity style={[styles.checkboxContainer, { width: widthCheckbox }]} onPress={onToggle} activeOpacity={0.7}>
    <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
      {checked && <Text style={styles.checkmark}>✓</Text>}
    </View>
    {typeof label === 'string' ? (
      <Text style={styles.termsText}>{label}</Text>
    ) : (
      label
    )}
  </TouchableOpacity>
));

// Submit Button Component
interface SubmitButtonProps {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export const SubmitButton = memo<SubmitButtonProps>(({
  title,
  onPress,
  isLoading,
  disabled,
}) => (
  <TouchableOpacity
    style={[styles.button, (isLoading || disabled) && styles.buttonDisabled]}
    onPress={onPress}
    disabled={isLoading || disabled}
    activeOpacity={0.8}
  >
    {isLoading ? (
      <Text style={styles.buttonText}>Đang xử lý...</Text>
    ) : (
      <Text style={styles.buttonText}>{title}</Text>
    )}
  </TouchableOpacity>
));

const styles = StyleSheet.create({
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: scale(14),
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: spacing.xs,
  },
  labelError: {
    color: Colors.dark.error,
  },
  input: {
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: scale(12),
    paddingHorizontal: spacing.md,
    paddingVertical: scale(14),
    fontSize: scale(16),
    color: Colors.dark.text,
  },
  inputError: {
    borderColor: Colors.dark.error,
  },
  errorText: {
    fontSize: scale(12),
    color: Colors.dark.error,
    marginTop: scale(4),
  },
  hint: {
    fontSize: scale(12),
    color: Colors.dark.textTertiary,
    marginTop: scale(4),
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: scale(50),
  },
  eyeButton: {
    position: 'absolute',
    right: spacing.md,
    top: scale(14),
    padding: scale(4),
  },
  eyeText: {
    fontSize: scale(20),
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: scale(4),
  },
  checkbox: {
    width: scale(20),
    height: scale(20),
    borderRadius: scale(4),
    borderWidth: 2,
    borderColor: Colors.dark.border,
    marginRight: scale(10),
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: scale(2),
  },
  checkboxChecked: {
    backgroundColor: Colors.dark.primary,
    borderColor: Colors.dark.primary,
  },
  checkmark: {
    color: Colors.dark.textInverse,
    fontSize: scale(12),
    fontWeight: 'bold',
  },
  termsText: {
    fontSize: scale(13),
    color: Colors.dark.textSecondary,
    lineHeight: scale(20),
  },
  button: {
    backgroundColor: Colors.dark.primary,
    borderRadius: scale(14),
    paddingVertical: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: scale(16),
    fontWeight: '600',
    color: Colors.dark.textInverse,
  },
});
