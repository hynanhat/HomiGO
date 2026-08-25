import { useEffect, useRef, useState } from 'react'
import {
  BadgeCheck,
  BriefcaseBusiness,
  Check,
  CircleAlert,
  Clock3,
  History,
  LockKeyhole,
  ShieldCheck,
} from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { Button, Card, Pagination } from '@/components/ui'
import { ErrorState, Skeleton, useToast } from '@/components/feedback'
import { accountKeys } from '@/features/account/accountQueries'
import { getProfile } from '@/features/auth/authApi'
import {
  paymentKeys,
  useCreateSellerUpgradeCheckout,
  useSellerUpgradeHistory,
  useSellerUpgradeOffer,
  useSellerUpgradePayment,
} from '@/features/payments/paymentQueries'
import { submitSePayCheckout } from '@/features/payments/sePayForm'
import type { PaymentStatus, SellerUpgradePayment } from '@/features/payments/paymentTypes'
import { useAuth } from '@/context/AuthContext'
import { getSafeErrorMessage } from '@/lib/api/apiError'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { useQueryClient } from '@tanstack/react-query'

const benefits = [
  'Tạo và quản lý tin đăng bất động sản',
  'Theo dõi trạng thái kiểm duyệt và hiệu quả tin',
  'Nhận thông báo khi tin được duyệt hoặc từ chối',
]

const statusLabels: Record<PaymentStatus, string> = {
  PENDING: 'Chờ thanh toán',
  SUCCESS: 'Thành công',
  FAILED: 'Thất bại',
  CANCELLED: 'Đã hủy',
  EXPIRED: 'Hết hạn',
}

function PaymentBadge({ status }: { status: PaymentStatus }) {
  if (status === 'SUCCESS') return <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">{statusLabels[status]}</span>
  if (status === 'PENDING') return <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-900">{statusLabels[status]}</span>
  return <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{statusLabels[status]}</span>
}

function CallbackStatus({ callback, payment }: { callback: string | null; payment?: SellerUpgradePayment }) {
  if (!callback) return null
  if (payment?.status === 'SUCCESS') {
    return (
      <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-5" role="status">
        <div className="flex gap-3"><BadgeCheck className="size-6 shrink-0 text-emerald-700" aria-hidden="true" /><div><h2 className="font-bold text-emerald-950">Thanh toán đã được xác nhận</h2><p className="mt-1 text-sm text-emerald-800">Tài khoản của bạn đã có quyền người bán.</p></div></div>
      </section>
    )
  }
  if (callback === 'success' && payment?.status === 'PENDING') {
    return (
      <section className="rounded-xl border border-amber-200 bg-amber-50 p-5" role="status">
        <div className="flex gap-3"><Clock3 className="size-6 shrink-0 text-amber-700" aria-hidden="true" /><div><h2 className="font-bold text-amber-950">Đang chờ SePay xác nhận</h2><p className="mt-1 text-sm text-amber-900">Bạn đã quay lại từ cổng thanh toán. Trang đang tự kiểm tra IPN; chưa có quyền Seller cho đến khi backend xác nhận.</p></div></div>
      </section>
    )
  }
  if (callback === 'cancel' || callback === 'error') {
    return (
      <section className="rounded-xl border border-red-200 bg-red-50 p-5" role="alert">
        <div className="flex gap-3"><CircleAlert className="size-6 shrink-0 text-red-700" aria-hidden="true" /><div><h2 className="font-bold text-red-950">Thanh toán chưa hoàn tất</h2><p className="mt-1 text-sm text-red-800">SePay báo giao dịch bị hủy hoặc gặp lỗi. Tài khoản chưa được nâng cấp và bạn có thể thử lại.</p></div></div>
      </section>
    )
  }
  if (payment?.status === 'EXPIRED') {
    return <section className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">Đơn trước đã hết hạn. Hãy tạo checkout mới để tiếp tục.</section>
  }
  return null
}

export default function SellerUpgradePage() {
  const [searchParams] = useSearchParams()
  const callback = searchParams.get('payment')
  const orderCode = searchParams.get('orderCode')
  const [historyPage, setHistoryPage] = useState(0)
  const [syncingRole, setSyncingRole] = useState(false)
  const roleSynced = useRef(false)
  const offer = useSellerUpgradeOffer()
  const createCheckout = useCreateSellerUpgradeCheckout()
  const payment = useSellerUpgradePayment(orderCode)
  const history = useSellerUpgradeHistory(historyPage)
  const { user, refresh, updateUser } = useAuth()
  const { showToast } = useToast()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (payment.data?.status !== 'SUCCESS') return
    void queryClient.invalidateQueries({ queryKey: paymentKeys.all })
    if (user?.role !== 'USER' || roleSynced.current) return
    roleSynced.current = true
    setSyncingRole(true)
    void (async () => {
      try {
        const accessToken = await refresh()
        if (!accessToken) throw new Error('Không thể làm mới phiên đăng nhập.')
        const profile = await getProfile()
        updateUser({ id: profile.id, name: profile.name, email: profile.email, role: profile.role })
        queryClient.setQueryData(accountKeys.profile, profile)
        showToast({ type: 'success', title: 'Đã mở quyền người bán' })
      } catch (error) {
        roleSynced.current = false
        showToast({ type: 'error', title: 'Thanh toán thành công nhưng chưa làm mới được phiên', description: getSafeErrorMessage(error) })
      } finally {
        setSyncingRole(false)
      }
    })()
  }, [payment.data?.status, queryClient, refresh, showToast, updateUser, user?.role])

  const startCheckout = async () => {
    try {
      const checkout = await createCheckout.mutateAsync()
      submitSePayCheckout(checkout)
    } catch (error) {
      showToast({ type: 'error', title: 'Không thể mở SePay Sandbox', description: getSafeErrorMessage(error) })
    }
  }

  if (offer.isPending) return <main className="mx-auto max-w-6xl px-4 py-10"><Skeleton className="h-[36rem]" /></main>
  if (offer.isError) return <main className="mx-auto max-w-4xl px-4 py-10"><ErrorState onRetry={() => offer.refetch()} /></main>

  const alreadySeller = user?.role === 'SELLER' || user?.role === 'ADMIN'
  const canCheckout = !alreadySeller && offer.data.configured

  return (
    <main className="bg-slate-50 px-4 py-10 sm:py-14">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.15fr_.85fr]">
        <section className="space-y-6">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-700">HomiGO Seller</p>
            <h1 className="mt-3 max-w-2xl text-3xl font-extrabold tracking-tight text-ink-950 sm:text-4xl">Mở quyền đăng tin chuyên nghiệp</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-ink-600">Thanh toán một lần qua SePay Sandbox. Quyền Seller chỉ được cấp sau khi HomiGO nhận và xác minh IPN từ SePay.</p>
          </div>

          <CallbackStatus callback={callback} payment={payment.data} />
          {payment.isError && orderCode && <ErrorState title="Không thể kiểm tra đơn thanh toán" description="Đơn không tồn tại hoặc không thuộc tài khoản hiện tại." onRetry={() => payment.refetch()} />}

          <Card className="p-6 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex size-12 items-center justify-center rounded-xl bg-brand-50 text-brand-700"><BriefcaseBusiness className="size-6" aria-hidden="true" /></div>
                <h2 className="mt-4 text-2xl font-bold">Gói người bán HomiGO</h2>
                <p className="mt-2 text-sm text-ink-600">Thanh toán thử nghiệm, không phát sinh tiền thật.</p>
              </div>
              <div className="sm:text-right"><p className="text-sm font-semibold text-ink-600">Thanh toán một lần</p><p className="mt-1 text-3xl font-extrabold text-brand-700">{formatCurrency(offer.data.amount)}</p></div>
            </div>

            <ul className="mt-7 grid gap-3">
              {benefits.map((benefit) => <li key={benefit} className="flex items-start gap-3 text-sm text-ink-800"><span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-700"><Check className="size-3.5" aria-hidden="true" /></span>{benefit}</li>)}
            </ul>

            {!offer.data.configured && <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950" role="alert">Backend chưa có `SEPAY_MERCHANT_ID` và `SEPAY_SECRET_KEY`. Hãy cấu hình credential Sandbox mới trước khi thanh toán.</div>}

            {alreadySeller ? (
              <Link className="mt-7 inline-flex min-h-12 items-center justify-center rounded-lg bg-brand-600 px-5 font-semibold text-white hover:bg-brand-700" to="/seller">Đi tới trang người bán</Link>
            ) : (
              <Button className="mt-7 w-full sm:w-auto" size="lg" loading={createCheckout.isPending || syncingRole} disabled={!canCheckout} onClick={startCheckout}>Thanh toán qua SePay Sandbox</Button>
            )}

            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-ink-600"><span className="inline-flex items-center gap-1.5"><LockKeyhole className="size-4" aria-hidden="true" />Secret chỉ nằm ở backend</span><span className="inline-flex items-center gap-1.5"><ShieldCheck className="size-4" aria-hidden="true" />Xác nhận bằng IPN</span></div>
          </Card>
        </section>

        <aside>
          <Card className="p-6">
            <div className="flex items-center gap-3"><History className="size-5 text-brand-700" aria-hidden="true" /><h2 className="text-lg font-bold">Lịch sử nâng cấp</h2></div>
            {history.isPending && <Skeleton className="mt-5 h-40" />}
            {history.isError && <div className="mt-5"><ErrorState description="Không tải được lịch sử thanh toán." onRetry={() => history.refetch()} /></div>}
            {history.data?.empty && <p className="mt-5 rounded-lg bg-slate-50 p-4 text-sm text-ink-600">Bạn chưa có giao dịch nâng cấp nào.</p>}
            {history.data && !history.data.empty && (
              <div className="mt-5 space-y-3">
                {history.data.content.map((item) => (
                  <article key={item.id} className="rounded-lg border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-bold text-ink-950">{item.orderCode}</p><p className="mt-1 text-xs text-ink-600">{formatDate(item.createdAt)}</p></div><PaymentBadge status={item.status} /></div>
                    <p className="mt-3 text-sm font-bold text-brand-700">{formatCurrency(item.amount)}</p>
                  </article>
                ))}
                <Pagination page={history.data.number} totalPages={history.data.totalPages} disabled={history.isFetching} onPageChange={setHistoryPage} />
              </div>
            )}
          </Card>
        </aside>
      </div>
    </main>
  )
}
