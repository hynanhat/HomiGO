import { z } from 'zod'

const email = z.email('Email không hợp lệ.')
const password = z
  .string()
  .min(12, 'Mật khẩu phải có ít nhất 12 ký tự.')
  .max(72, 'Mật khẩu không được vượt quá 72 ký tự.')
const phone = z
  .string()
  .regex(/^\+?[0-9]{9,15}$/, 'Số điện thoại không hợp lệ.')
  .or(z.literal(''))

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Vui lòng nhập mật khẩu.'),
})
export const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Họ tên phải có ít nhất 2 ký tự.').max(100),
    email,
    password,
    confirmPassword: z.string(),
    phone,
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Mật khẩu xác nhận không khớp.',
  })
export const profileSchema = z.object({
  name: z.string().trim().min(2, 'Họ tên phải có ít nhất 2 ký tự.').max(100),
  phone,
})
export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại.'),
    newPassword: password,
    confirmPassword: z.string(),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Mật khẩu xác nhận không khớp.',
  })

export type LoginForm = z.infer<typeof loginSchema>
export type RegisterForm = z.infer<typeof registerSchema>
export type ProfileForm = z.infer<typeof profileSchema>
export type PasswordForm = z.infer<typeof passwordSchema>
