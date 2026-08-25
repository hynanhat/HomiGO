import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button, Card, Input } from '@/components/ui'
import { useToast } from '@/components/feedback'
import { useAuth } from '@/context/AuthContext'
import { loginAccount } from '@/features/auth/authApi'
import { loginSchema, type LoginForm } from '@/features/auth/authSchemas'
import { ApiError, getSafeErrorMessage } from '@/lib/api/apiError'

function intendedDestination(state: unknown) { const from = (state as { from?: unknown } | null)?.from; return typeof from === 'string' && from.startsWith('/') && !from.startsWith('//') ? from : '/' }
export default function LoginPage() {
  const { login } = useAuth(); const location = useLocation(); const navigate = useNavigate(); const { showToast } = useToast()
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<LoginForm>({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' } })
  const submit = handleSubmit(async (values) => { try { const session = await loginAccount(values); login(session); navigate(intendedDestination(location.state), { replace: true }) } catch (error) { if (error instanceof ApiError) Object.entries(error.fieldErrors).forEach(([field, message]) => { if (field === 'email' || field === 'password') setError(field, { message }) }); showToast({ type: 'error', title: 'Đăng nhập không thành công', description: getSafeErrorMessage(error) }) } })
  return <main className="grid min-h-[70vh] place-items-center bg-slate-50 px-4 py-12"><Card className="w-full max-w-md p-6 sm:p-8"><h1 className="text-3xl font-extrabold">Đăng nhập</h1><p className="mt-2 text-ink-600">Tiếp tục quản lý tài khoản HomiGO của bạn.</p><form className="mt-7 grid gap-5" onSubmit={submit} noValidate><Input label="Email" type="email" autoComplete="email" required error={errors.email?.message} {...register('email')} /><Input label="Mật khẩu" type="password" autoComplete="current-password" required error={errors.password?.message} {...register('password')} /><Button type="submit" size="lg" loading={isSubmitting}>Đăng nhập</Button></form><p className="mt-6 text-center text-sm">Chưa có tài khoản? <Link className="font-bold text-brand-700" to="/auth/register" state={location.state}>Đăng ký ngay</Link></p></Card></main>
}
