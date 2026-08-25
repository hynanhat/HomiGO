import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button, Card, Input } from '@/components/ui'
import { useToast } from '@/components/feedback'
import { registerAccount } from '@/features/auth/authApi'
import { registerSchema, type RegisterForm } from '@/features/auth/authSchemas'
import { ApiError, getSafeErrorMessage } from '@/lib/api/apiError'

export default function RegisterPage() {
  const navigate = useNavigate(); const location = useLocation(); const { showToast } = useToast()
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema), defaultValues: { name: '', email: '', phone: '', password: '', confirmPassword: '' } })
  const submit = handleSubmit(async ({ confirmPassword: _confirmPassword, ...values }) => { try { await registerAccount({ ...values, phone: values.phone || undefined }); showToast({ type: 'success', title: 'Đăng ký thành công', description: 'Bạn có thể đăng nhập ngay.' }); navigate('/auth/login', { replace: true, state: location.state }) } catch (error) { if (error instanceof ApiError) Object.entries(error.fieldErrors).forEach(([field, message]) => { if (['name', 'email', 'phone', 'password'].includes(field)) setError(field as keyof RegisterForm, { message }) }); showToast({ type: 'error', title: 'Không thể đăng ký', description: getSafeErrorMessage(error) }) } })
  return <main className="grid min-h-[70vh] place-items-center bg-slate-50 px-4 py-12"><Card className="w-full max-w-lg p-6 sm:p-8"><h1 className="text-3xl font-extrabold">Tạo tài khoản</h1><p className="mt-2 text-ink-600">Lưu tin yêu thích và bắt đầu đăng bất động sản.</p><form className="mt-7 grid gap-5" onSubmit={submit} noValidate><Input label="Họ và tên" autoComplete="name" required error={errors.name?.message} {...register('name')} /><Input label="Email" type="email" autoComplete="email" required error={errors.email?.message} {...register('email')} /><Input label="Số điện thoại" inputMode="tel" autoComplete="tel" error={errors.phone?.message} {...register('phone')} /><div className="grid gap-5 sm:grid-cols-2"><Input label="Mật khẩu" type="password" autoComplete="new-password" required error={errors.password?.message} {...register('password')} /><Input label="Xác nhận mật khẩu" type="password" autoComplete="new-password" required error={errors.confirmPassword?.message} {...register('confirmPassword')} /></div><Button type="submit" size="lg" loading={isSubmitting}>Đăng ký</Button></form><p className="mt-6 text-center text-sm">Đã có tài khoản? <Link className="font-bold text-brand-700" to="/auth/login" state={location.state}>Đăng nhập</Link></p></Card></main>
}
