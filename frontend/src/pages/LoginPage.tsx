import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button, Input } from '@/components/ui'
import { useToast } from '@/components/feedback'
import { useAuth } from '@/context/AuthContext'
import { loginAccount } from '@/features/auth/authApi'
import { loginSchema, type LoginForm } from '@/features/auth/authSchemas'
import { ApiError, getSafeErrorMessage } from '@/lib/api/apiError'

function intendedDestination(state: unknown) {
  const from = (state as { from?: unknown } | null)?.from
  return typeof from === 'string' && from.startsWith('/') && !from.startsWith('//') ? from : '/'
}

export default function LoginPage() {
  const { login } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const submit = handleSubmit(async (values) => {
    try {
      const session = await loginAccount(values)
      login(session)
      navigate(intendedDestination(location.state), { replace: true })
    } catch (error) {
      if (error instanceof ApiError) {
        Object.entries(error.fieldErrors).forEach(([field, message]) => {
          if (field === 'email' || field === 'password') setError(field, { message })
        })
      }
      showToast({
        type: 'error',
        title: 'Đăng nhập không thành công',
        description: getSafeErrorMessage(error),
      })
    }
  })

  return (
    <main className="grid min-h-[calc(100svh_-_var(--header-height))] place-items-center px-4 py-10 sm:px-6">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-brand-100 bg-white/90 shadow-[var(--shadow-dialog)] backdrop-blur lg:grid-cols-[1.1fr_1fr]">
        <div className="relative hidden min-h-[38rem] overflow-hidden bg-ink-950 lg:block">
          <img
            src="/homigo-hero-v2.jpg"
            alt=""
            width="1536"
            height="1024"
            className="absolute inset-0 size-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-10 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-200">
              Chào mừng trở lại
            </p>
            <h2 className="mt-3 text-3xl font-bold">Mọi lựa chọn của bạn, trong một nơi.</h2>
            <p className="mt-4 max-w-sm leading-7 text-slate-200">
              Tiếp tục lưu tin, theo dõi cập nhật và quản lý hành trình bất động sản của bạn.
            </p>
          </div>
        </div>
        <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-12">
          <p className="eyebrow">Tài khoản HomiGO</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Đăng nhập</h1>
          <p className="mt-3 text-ink-600">Tiếp tục quản lý tài khoản và các lựa chọn của bạn.</p>
          <form className="mt-8 grid gap-5" onSubmit={submit} noValidate>
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              required
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Mật khẩu"
              type="password"
              autoComplete="current-password"
              required
              error={errors.password?.message}
              {...register('password')}
            />
            <Button type="submit" size="lg" loading={isSubmitting}>
              Đăng nhập
            </Button>
          </form>
          <p className="mt-7 text-center text-sm text-ink-600">
            Chưa có tài khoản?{' '}
            <Link
              className="font-bold text-brand-700 underline decoration-brand-200 underline-offset-4 hover:text-brand-800"
              to="/auth/register"
              state={location.state}
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </section>
    </main>
  )
}
