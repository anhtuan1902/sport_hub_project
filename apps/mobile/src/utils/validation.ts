// Validation utilities using Zod
import { z } from 'zod';

// Email validation schema
export const emailSchema = z.string()
  .min(1, 'Email là bắt buộc')
  .email('Email không hợp lệ');

// Phone validation schema (Vietnamese format)
export const phoneSchema = z.string()
  .regex(/^(0[0-9]{9,10})$/, 'Số điện thoại không hợp lệ')
  .optional()
  .or(z.literal(''));

// Password validation schema
export const passwordSchema = z
  .string()
  .min(1, 'Mật khẩu là bắt buộc')
  .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
  .regex(/[A-Z]/, 'Mật khẩu phải có ít nhất 1 chữ hoa')
  .regex(/[a-z]/, 'Mật khẩu phải có ít nhất 1 chữ thường')
  .regex(/[0-9]/, 'Mật khẩu phải có ít nhất 1 số');

// Name validation schema
export const nameSchema = z.string()
  .min(1, 'Họ tên là bắt buộc')
  .min(2, 'Họ tên phải có ít nhất 2 ký tự');

// Login form schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Mật khẩu là bắt buộc'),
  rememberMe: z.boolean().optional(),
});

// Register form schema
export const registerSchema = z.object({
  fullName: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Xác nhận mật khẩu là bắt buộc'),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'Bạn cần đồng ý với điều khoản sử dụng' }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
});

// Type inference
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;

// Forgot Password schema
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
