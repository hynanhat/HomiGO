import { useState } from 'react'
import { Bell, Check, CheckCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { EmptyState, ErrorState, Skeleton } from '@/components/feedback'
import { Button, Pagination } from '@/components/ui'
import { formatDate } from '@/lib/formatters'
import { notificationTarget } from '@/features/notifications/notificationApi'
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadCount,
} from '@/features/notifications/notificationQueries'

export default function NotificationsPage() {
  const [page, setPage] = useState(0)
  const [unreadOnly, setUnreadOnly] = useState(false)
  const notifications = useNotifications(page, unreadOnly)
  const unreadCount = useUnreadCount()
  const markRead = useMarkNotificationRead()
  const markAll = useMarkAllNotificationsRead()

  return (
    <main className="mx-auto min-h-[60vh] max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-brand-700">
            Trung tâm cập nhật
          </p>
          <h1 className="mt-2 text-3xl font-extrabold text-ink-950">Thông báo của bạn</h1>
          <p className="mt-2 text-ink-600">
            Theo dõi trạng thái tin đăng và các công việc cần xử lý.
          </p>
        </div>
        <Button
          variant="secondary"
          disabled={(unreadCount.data?.count ?? 0) === 0}
          loading={markAll.isPending}
          onClick={() => markAll.mutate()}
        >
          <CheckCheck className="size-4" aria-hidden="true" />
          Đánh dấu tất cả đã đọc
        </Button>
      </div>

      <div className="mt-8 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
        <p className="text-sm font-semibold text-ink-800">
          {unreadCount.data?.count ?? 0} thông báo chưa đọc
        </p>
        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-ink-700">
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={(event) => {
              setUnreadOnly(event.target.checked)
              setPage(0)
            }}
          />
          Chỉ xem chưa đọc
        </label>
      </div>

      <div className="mt-5 grid gap-3">
        {notifications.isLoading &&
          Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-28" />)}
        {notifications.isError && <ErrorState onRetry={() => notifications.refetch()} />}
        {notifications.data?.empty && (
          <EmptyState
            title="Chưa có thông báo"
            description={
              unreadOnly
                ? 'Bạn đã đọc hết các thông báo hiện có.'
                : 'Các cập nhật quan trọng sẽ xuất hiện tại đây.'
            }
          />
        )}
        {notifications.data?.content.map((notification) => {
          const target = notificationTarget(notification)
          return (
            <article
              key={notification.id}
              className={`notification-row ${notification.read ? '' : 'is-unread'}`}
            >
              <span className="notification-icon">
                <Bell className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-bold text-ink-950">{notification.title}</h2>
                  {!notification.read && (
                    <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-bold text-brand-800">
                      Mới
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-ink-700">{notification.message}</p>
                <p className="mt-2 text-xs text-ink-500">{formatDate(notification.createdAt)}</p>
              </div>
              <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                {target && (
                  <Link
                    className="inline-flex min-h-11 items-center justify-center rounded-xl border border-brand-200 bg-white px-3 text-sm font-bold text-ink-950 shadow-sm transition hover:border-brand-500 hover:bg-brand-50"
                    to={target}
                    onClick={() => !notification.read && markRead.mutate(notification.id)}
                  >
                    Mở chi tiết
                  </Link>
                )}
                {!notification.read && (
                  <Button
                    size="sm"
                    variant="ghost"
                    loading={markRead.isPending}
                    onClick={() => markRead.mutate(notification.id)}
                  >
                    <Check className="size-4" aria-hidden="true" />
                    Đã đọc
                  </Button>
                )}
              </div>
            </article>
          )
        })}
      </div>

      {notifications.data && (
        <div className="mt-6">
          <Pagination
            page={page}
            totalPages={notifications.data.totalPages}
            onPageChange={setPage}
            disabled={notifications.isFetching}
          />
        </div>
      )}
    </main>
  )
}
