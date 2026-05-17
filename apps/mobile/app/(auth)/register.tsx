import { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore, useToastStore } from '@/src/store';
import { registerSchema, RegisterFormData } from '@/src/utils/validation';
import { Colors } from '@/src/constants/colors';
import { InputField, PasswordInput, Checkbox, SubmitButton } from '@/src/components/FormInput';
import { scale, spacing } from '@/src/utils';

const INITIAL_VALUES: RegisterFormData = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false as unknown as true,
};

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();
  const { showToast } = useToastStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: INITIAL_VALUES,
    mode: 'onBlur',
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await register({
        email: data.email.trim(),
        password: data.password,
        fullName: data.fullName.trim(),
        phone: data.phone?.trim() || undefined,
      });
      showToast('Đăng ký thành công! Chào mừng bạn đến với SportHub!', 'success');
      router.replace('/(tabs)' as Href);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Đăng ký thất bại. Vui lòng thử lại.';
      showToast(message, 'error');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={'padding'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Tạo tài khoản</Text>
          <Text style={styles.subtitle}>Tham gia cộng đồng SportHub</Text>
        </View>

        <View style={styles.form}>
          <Controller
            control={control}
            name="fullName"
            render={({ field: { onChange, onBlur, value } }) => (
              <InputField
                label="Họ tên *"
                placeholder="Nhập họ tên của bạn"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                autoCapitalize="words"
                error={errors.fullName?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <InputField
                label="Email *"
                placeholder="Nhập email của bạn"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                error={errors.email?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <InputField
                label="Số điện thoại (tùy chọn)"
                placeholder="Nhập số điện thoại"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="phone-pad"
                error={errors.phone?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <PasswordInput
                label="Mật khẩu *"
                placeholder="Tạo mật khẩu"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                showPassword={showPassword}
                onToggleVisibility={() => setShowPassword(!showPassword)}
                error={errors.password?.message}
              />
            )}
          />
          <Text style={styles.passwordHint}>Ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số</Text>

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <InputField
                label="Xác nhận mật khẩu *"
                placeholder="Nhập lại mật khẩu"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                error={errors.confirmPassword?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="acceptTerms"
            render={({ field: { value, onChange } }) => (
              <Checkbox
                checked={value as boolean}
                onToggle={() => onChange(!value)}
                widthCheckbox={'90%'}
                label="Đồng ý với điều khoản sử dụng và chính sách bảo mật"
              />
            )}
          />
          {errors.acceptTerms && <Text style={styles.termsError}>{errors.acceptTerms.message}</Text>}

          <SubmitButton
            title="Tạo tài khoản"
            onPress={handleSubmit(onSubmit)}
            isLoading={isLoading}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Đã có tài khoản?</Text>
          <Link href="/(auth)/login" asChild>
            <Text style={styles.linkText}>Đăng nhập</Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xxxl,
    paddingTop: scale(60),
    paddingBottom: scale(40),
  },
  header: {
    marginBottom: scale(12),
  },
  title: {
    fontSize: scale(28),
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: scale(16),
    color: Colors.dark.textSecondary,
  },
  form: {
    flex: 1,
    gap: spacing.md,
  },
  passwordHint: {
    fontSize: scale(12),
    color: Colors.dark.textTertiary,
    marginTop: scale(-8),
    marginBottom: spacing.md,
  },
  termsError: {
    fontSize: scale(12),
    color: Colors.dark.error,
    marginTop: scale(-8),
    marginBottom: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: scale(4),
  },
  footerText: {
    fontSize: scale(14),
    color: Colors.dark.textSecondary,
  },
  linkText: {
    fontSize: scale(14),
    color: Colors.dark.primary,
    fontWeight: '600',
  },
});
