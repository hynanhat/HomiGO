import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { Button, Card, Input } from '@/components/ui'
import { ErrorState, Skeleton, useToast } from '@/components/feedback'
import { useAuth } from '@/context/AuthContext'
import { useProfile, useUpdateProfile } from '@/features/account/accountQueries'
import { profileSchema, type ProfileForm } from '@/features/auth/authSchemas'
import { getSafeErrorMessage } from '@/lib/api/apiError'

export default function ProfilePage() {
  const profile = useProfile()
  const update = useUpdateProfile()
  const { updateUser } = useAuth()
  const { showToast } = useToast()
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: '', phone: '' },
  })
  useEffect(() => {
    if (profile.data) reset({ name: profile.data.name, phone: profile.data.phone ?? '' })
  }, [profile.data, reset])
  if (profile.isPending) return <Skeleton className="h-96" />
  if (profile.isError) return <ErrorState onRetry={() => profile.refetch()} />
  const submit = handleSubmit(async (values) => {
    try {
      const result = await update.mutateAsync({
        name: values.name,
        phone: values.phone || undefined,
      })
      updateUser({ id: result.id, name: result.name, email: result.email, role: result.role })
      showToast({ type: 'success', title: 'Đã cập nhật hồ sơ' })
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Không thể cập nhật',
        description: getSafeErrorMessage(error),
      })
    }
  })
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold">Hồ sơ cá nhân</h2>
      <p className="mt-1 text-sm text-ink-600">Email: {profile.data.email}</p>
      <form className="mt-6 grid max-w-xl gap-5" onSubmit={submit}>
        <Input label="Họ và tên" required error={errors.name?.message} {...register('name')} />
        <Input
          label="Số điện thoại"
          inputMode="tel"
          error={errors.phone?.message}
          {...register('phone')}
        />
        <Button className="justify-self-start" type="submit" loading={update.isPending}>
          Lưu thay đổi
        </Button>
      </form>
      {profile.data.role === 'USER' && (
        <section className="mt-8 rounded-xl bg-brand-50 p-5">
          <h3 className="font-bold">Bạn muốn đăng tin?</h3>
          <p className="mt-1 text-sm">
            Thanh toán một lần qua SePay Sandbox để mở quyền người bán.
          </p>
          <Link className="mt-4 inline-block font-bold text-brand-700" to="/seller/upgrade">
            Xem gói nâng cấp →
          </Link>
        </section>
      )}
    </Card>
  )
}
