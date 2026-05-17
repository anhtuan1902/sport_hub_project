import { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
  Image, Animated, Easing,
  StatusBar,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useAuthStore, useToastStore } from '@/src/store';
import { loginSchema, LoginFormData } from '@/src/utils/validation';
import { Colors } from '@/src/constants/colors';
import { InputField, PasswordInput, Checkbox, SubmitButton } from '@/src/components/FormInput';
import { scale, spacing } from '@/src/utils';

const SOCIAL_PROVIDERS = [
  { id: 'google', icon: 'logo-google' as const, label: 'Google' },
  { id: 'facebook', icon: 'logo-facebook' as const, label: 'Facebook' },
  { id: 'apple', icon: 'logo-apple' as const, label: 'Apple' },
];

const useLogoAnimation = () => {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 600, easing: Easing.out(Easing.ease), useNativeDriver: true }),
    ]).start(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.05, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      ).start();
    });
  }, [scale, opacity, pulse]);

  return { opacity, scale, pulse };
};

const Logo = () => {
  const { opacity, scale, pulse } = useLogoAnimation();
  return (
    <Animated.View style={[styles.logoContainer, { opacity, transform: [{ scale: Animated.multiply(scale, pulse) }] }]}>
      <Image source={require('../../assets/images/sport-hub-logo.png')} style={styles.logo} resizeMode="contain" />
    </Animated.View>
  );
};

const SocialButton = ({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) => (
  <TouchableOpacity style={styles.socialButton} onPress={onPress} accessibilityLabel={`Đăng nhập với ${label}`}>
    <Ionicons name={icon} size={24} color={Colors.dark.text} />
  </TouchableOpacity>
);

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const { showToast } = useToastStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
    mode: 'onBlur',
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login({ email: data.email.trim(), password: data.password, rememberMe: data.rememberMe });
      router.replace('/(tabs)' as Href);
      showToast('Đăng nhập thành công!', 'success');
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : 'Đăng nhập thất bại. Vui lòng thử lại.', 'error');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.dark.background} />
      <KeyboardAvoidingView style={styles.keyboardView} behavior={'padding'}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Logo />
            <Text style={styles.title}>Chào mừng bạn!</Text>
            <Text style={styles.subtitle}>Đăng nhập để tiếp tục</Text>
          </View>

          <View style={styles.form}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <InputField
                  label="Email"
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
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <PasswordInput
                  label="Mật khẩu"
                  placeholder="Nhập mật khẩu"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                  showPassword={showPassword}
                  onToggleVisibility={() => setShowPassword(!showPassword)}
                />
              )}
            />

            <View style={styles.optionsRow}>
              <Controller
                control={control}
                name="rememberMe"
                render={({ field: { value = false, onChange } }) => (
                  <Checkbox checked={value} onToggle={() => onChange(!value)} label="Ghi nhớ đăng nhập" />
                )}
              />
              <Link href="/(auth)/forgot-password" asChild>
                <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Text style={styles.forgotLink}>Quên mật khẩu?</Text>
                </TouchableOpacity>
              </Link>
            </View>

            <SubmitButton title="Đăng nhập" onPress={handleSubmit(onSubmit)} isLoading={isLoading} />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>hoặc</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialButtons}>
              {SOCIAL_PROVIDERS.filter(({ id }) => Platform.OS === 'ios' || id !== 'apple').map(({ id, icon, label }) => (
                <SocialButton key={id} icon={icon} label={label} onPress={() => Alert.alert('Thông báo', `Đăng nhập với ${label} đang được phát triển`)} />
              ))}
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Chưa có tài khoản?</Text>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity>
                <Text style={styles.linkText}>Đăng ký ngay</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xxxl,
    paddingTop: scale(80),
    paddingBottom: scale(40),
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: scale(40),
  },
  title: {
    fontSize: scale(28),
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: spacing.xs,
  },
  logo: {
    width: scale(150),
    height: scale(150),
  },
  subtitle: {
    fontSize: scale(16),
    color: Colors.dark.textSecondary,
  },
  form: {
    flex: 1,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xxl,
    marginTop: spacing.md,
  },
  forgotLink: {
    fontSize: scale(14),
    color: Colors.brand.neon,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.dark.border,
  },
  dividerText: {
    paddingHorizontal: spacing.md,
    fontSize: scale(14),
    color: Colors.dark.textTertiary,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
  },
  socialButton: {
    width: scale(56),
    height: scale(56),
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: scale(12),
    justifyContent: 'center',
    alignItems: 'center',
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
    color: Colors.dark.textSecondary,
  },
  linkText: {
    fontSize: scale(14),
    color: Colors.brand.neon,
    fontWeight: '600',
  },
});
