import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button, Input } from '@/components/ui'
import { useToast } from '@/components/feedback'
import { registerAccount } from '@/features/auth/authApi'
import { registerSchema, type RegisterForm } from '@/features/auth/authSchemas'
import { ApiError, getSafeErrorMessage } from '@/lib/api/apiError'

export default function RegisterPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { showToast } = useToast()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', phone: '', password: '', confirmPassword: '' },
  })

  const submit = handleSubmit(async ({ confirmPassword: _confirmPassword, ...values }) => {
    try {
      await registerAccount({ ...values, phone: values.phone || undefined })
      showToast({
        type: 'success',
        title: 'Đăng ký thành công',
        description: 'Bạn có thể đăng nhập ngay.',
      })
      navigate('/auth/login', { replace: true, state: location.state })
    } catch (error) {
      if (error instanceof ApiError) {
        Object.entries(error.fieldErrors).forEach(([field, message]) => {
          if (['name', 'email', 'phone', 'password'].includes(field))
            setError(field as keyof RegisterForm, { message })
        })
      }
      showToast({
        type: 'error',
        title: 'Không thể đăng ký',
        description: getSafeErrorMessage(error),
      })
    }
  })

  return (
    <main className="grid min-h-[calc(100svh_-_var(--header-height))] place-items-center px-4 py-10 sm:px-6">
      <section className="grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-brand-100 bg-white/90 shadow-[var(--shadow-dialog)] backdrop-blur lg:grid-cols-[0.9fr_1.2fr]">
        <div className="relative hidden min-h-[45rem] overflow-hidden bg-ink-950 lg:block">
          <img
            src="/homigo-hero-v2.jpg"
            alt=""
            width="1536"
            height="1024"
            className="absolute inset-0 size-full object-cover object-[65%_center]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/25 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-10 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-200">
              Bắt đầu cùng HomiGO
            </p>
            <h2 className="mt-3 text-3xl font-bold">Một tài khoản, trọn hành trình.</h2>
            <p className="mt-4 max-w-sm leading-7 text-slate-200">
              Lưu lựa chọn, nhận thông báo và sẵn sàng đăng bất động sản khi bạn cần.
            </p>
          </div>
        </div>
        <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-12">
          <p className="eyebrow">Tham gia HomiGO</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Tạo tài khoản</h1>
          <p className="mt-3 text-ink-600">
            Thiết lập hồ sơ để lưu tin yêu thích và bắt đầu đăng bất động sản.
          </p>
          <form className="mt-8 grid gap-5" onSubmit={submit} noValidate>
            <Input
              label="Họ và tên"
              autoComplete="name"
              required
              error={errors.name?.message}
              {...register('name')}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                label="Email"
                type="email"
                autoComplete="email"
                required
                error={errors.email?.message}
                {...register('email')}
              />
              <Input
                label="Số điện thoại"
                inputMode="tel"
                autoComplete="tel"
                error={errors.phone?.message}
                {...register('phone')}
              />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                label="Mật khẩu"
                type="password"
                autoComplete="new-password"
                required
                error={errors.password?.message}
                {...register('password')}
              />
              <Input
                label="Xác nhận mật khẩu"
                type="password"
                autoComplete="new-password"
                required
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />
            </div>
            <Button type="submit" size="lg" loading={isSubmitting}>
              Đăng ký
            </Button>
          </form>
          <p className="mt-7 text-center text-sm text-ink-600">
            Đã có tài khoản?{' '}
            <Link
              className="font-bold text-brand-700 underline decoration-brand-200 underline-offset-4 hover:text-brand-800"
              to="/auth/login"
              state={location.state}
            >
              Đăng nhập
            </Link>
          </p>
        </div>
      </section>
    </main>
  )
}
