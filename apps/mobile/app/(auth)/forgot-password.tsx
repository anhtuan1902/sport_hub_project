// Forgot Password Screen - Password reset request
import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { authApi } from '@/src/api';
import { Colors } from '@/src/constants';
import { forgotPasswordSchema, ForgotPasswordFormData } from '@/src/utils/validation';
import { scale, spacing } from '@/src/utils';
import { ArrowLeft, MailCheck } from 'lucide-react-native';

const EMAIL_PLACEHOLDER = 'Nhập email của bạn';
const SUBMIT_BUTTON_TEXT = 'Gửi yêu cầu';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
    mode: 'onBlur',
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await authApi.forgotPassword({ email: data.email.trim() });
      setIsSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Không thể gửi yêu cầu. Vui lòng thử lại.';
      Alert.alert('Lỗi', message);
    }
  };

  if (isSuccess) {
    return (
      <KeyboardAvoidingView style={styles.container} behavior={'padding'}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.successContainer}>
            <View style={styles.successIcon}>
              <MailCheck size={40} color={Colors.light.text} />
            </View>
            <Text style={styles.successTitle}>Kiểm tra email của bạn!</Text>
            <Text style={styles.successText}>
              Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email{' '}
              <Text style={styles.emailHighlight}>email</Text>
            </Text>
            <Text style={styles.hintText}>
              Nếu không thấy email, hãy kiểm tra thư mục spam.
            </Text>
            <TouchableOpacity style={styles.button} onPress={() => router.replace('/(auth)/login')}>
              <Text style={styles.buttonText}>Quay lại đăng nhập</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.resendButton} onPress={() => setIsSuccess(false)}>
              <Text style={styles.resendText}>Gửi lại email</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={'padding'}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={Colors.dark.textInverse} />
          </TouchableOpacity>
          <Text style={styles.title}>Quên mật khẩu?</Text>
          <Text style={styles.subtitle}>
            Không sao cả! Nhập email của bạn và chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu.
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  placeholder={EMAIL_PLACEHOLDER}
                  placeholderTextColor={Colors.light.textTertiary}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoFocus
                />
              )}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
          </View>

          <TouchableOpacity
            style={[styles.button, isSubmitting && styles.buttonDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={Colors.light.textInverse} />
            ) : (
              <Text style={styles.buttonText}>{SUBMIT_BUTTON_TEXT}</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Nhớ mật khẩu rồi?</Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={styles.linkText}>Đăng nhập</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xxl,
    paddingTop: scale(60),
    paddingBottom: scale(40),
  },
  header: {
    marginBottom: scale(10),
  },
  backButton: {
    marginBottom: scale(20),
  },
  backText: {
    fontSize: scale(28),
    color: Colors.light.text,
  },
  title: {
    fontSize: scale(28),
    fontWeight: 'bold',
    color: Colors.light.textInverse,
    marginBottom: scale(12),
  },
  subtitle: {
    fontSize: scale(16),
    color: Colors.light.textSecondary,
    lineHeight: scale(24),
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: scale(24),
  },
  label: {
    fontSize: scale(14),
    fontWeight: '600',
    color: Colors.light.textInverse,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: scale(12),
    paddingHorizontal: spacing.md,
    paddingVertical: scale(14),
    fontSize: scale(16),
    color: Colors.light.textInverse,
  },
  inputError: {
    borderColor: Colors.light.error,
  },
  errorText: {
    fontSize: scale(12),
    color: Colors.light.error,
    marginTop: scale(4),
  },
  button: {
    backgroundColor: Colors.light.primary,
    borderRadius: scale(14),
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: Colors.light.text,
    fontSize: scale(16),
    fontWeight: '600',
    paddingHorizontal: spacing.lg,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: scale(24),
    gap: scale(4),
  },
  footerText: {
    fontSize: scale(14),
    color: Colors.light.textSecondary,
  },
  linkText: {
    fontSize: scale(14),
    color: Colors.light.primary,
    fontWeight: '600',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: scale(40),
  },
  successIcon: {
    width: scale(80),
    height: scale(80),
    borderRadius: scale(40),
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: scale(5),
  },
  checkmark: {
    fontSize: scale(40),
    color: Colors.light.textInverse,
  },
  successTitle: {
    fontSize: scale(24),
    fontWeight: 'bold',
    color: Colors.light.textInverse,
    marginBottom: scale(12),
    textAlign: 'center',
  },
  successText: {
    fontSize: scale(16),
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: scale(24),
    marginBottom: scale(12),
    paddingHorizontal: scale(20),
  },
  emailHighlight: {
    color: Colors.light.primary,
    fontWeight: '600',
  },
  hintText: {
    fontSize: scale(14),
    color: Colors.light.textTertiary,
    textAlign: 'center',
    marginBottom: scale(32),
  },
  resendButton: {
    marginTop: scale(16),
    padding: scale(12),
  },
  resendText: {
    fontSize: scale(14),
    color: Colors.light.primary,
    fontWeight: '600',
  },
});
