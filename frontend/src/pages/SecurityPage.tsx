import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Button, Card, Input } from '@/components/ui'
import { useToast } from '@/components/feedback'
import { useAuth } from '@/context/AuthContext'
import { changePassword } from '@/features/auth/authApi'
import { passwordSchema, type PasswordForm } from '@/features/auth/authSchemas'
import { getSafeErrorMessage } from '@/lib/api/apiError'

export default function SecurityPage() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })
  const submit = handleSubmit(async ({ confirmPassword: _confirmPassword, ...values }) => {
    try {
      await changePassword(values)
      await logout()
      showToast({
        type: 'success',
        title: 'Đã đổi mật khẩu',
        description: 'Vui lòng đăng nhập lại.',
      })
      navigate('/auth/login', { replace: true })
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Không thể đổi mật khẩu',
        description: getSafeErrorMessage(error),
      })
    }
  })
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold">Bảo mật</h2>
      <p className="mt-2 text-sm text-ink-600">Đổi mật khẩu sẽ thu hồi các phiên hiện tại.</p>
      <form className="mt-6 grid max-w-xl gap-5" onSubmit={submit}>
        <Input
          label="Mật khẩu hiện tại"
          type="password"
          required
          error={errors.currentPassword?.message}
          {...register('currentPassword')}
        />
        <Input
          label="Mật khẩu mới"
          type="password"
          required
          error={errors.newPassword?.message}
          {...register('newPassword')}
        />
        <Input
          label="Xác nhận mật khẩu mới"
          type="password"
          required
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        <Button
          className="justify-self-start"
          type="submit"
          variant="danger"
          loading={isSubmitting}
        >
          Đổi mật khẩu
        </Button>
      </form>
    </Card>
  )
}
