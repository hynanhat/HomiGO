import { useEffect, useRef, useState } from 'react'
import { Bell, CheckCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui'
import { formatDate } from '@/lib/formatters'
import { notificationTarget } from '../notificationApi'
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadCount,
} from '../notificationQueries'

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const countQuery = useUnreadCount()
  const listQuery = useNotifications(0, true, 5)
  const markRead = useMarkNotificationRead()
  const markAll = useMarkAllNotificationsRead()
  const count = countQuery.data?.count ?? 0

  useEffect(() => {
    if (!open) return
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent && event.key !== 'Escape') return
      if (event instanceof MouseEvent && rootRef.current?.contains(event.target as Node)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', close)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', close)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className="relative grid size-10 place-items-center rounded-lg text-ink-800 transition hover:bg-slate-100"
        aria-label={`Thông báo${count ? `, ${count} chưa đọc` : ''}`}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((value) => !value)}
      >
        <Bell className="size-5" aria-hidden="true" />
        {count > 0 && (
          <span className="absolute right-0 top-0 grid min-h-5 min-w-5 place-items-center rounded-full bg-red-600 px-1 text-[0.65rem] font-bold text-white">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>

      {open && (
        <section className="notification-popover" role="dialog" aria-label="Thông báo mới">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <div>
              <h2 className="font-bold text-ink-950">Thông báo</h2>
              <p className="text-xs text-ink-600">{count} thông báo chưa đọc</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              disabled={count === 0}
              loading={markAll.isPending}
              onClick={() => markAll.mutate()}
            >
              <CheckCheck className="size-4" aria-hidden="true" />
              Đọc tất cả
            </Button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {listQuery.isLoading && <p className="p-4 text-sm text-ink-600">Đang tải thông báo…</p>}
            {listQuery.isError && <p className="p-4 text-sm text-red-700">Không thể tải thông báo.</p>}
            {listQuery.data?.content.map((notification) => {
              const target = notificationTarget(notification)
              const content = (
                <>
                  <span className="block font-semibold text-ink-950">{notification.title}</span>
                  <span className="mt-1 line-clamp-2 block text-sm text-ink-600">{notification.message}</span>
                  <span className="mt-2 block text-xs text-ink-500">{formatDate(notification.createdAt)}</span>
                </>
              )
              return target ? (
                <Link
                  key={notification.id}
                  to={target}
                  className="block border-b border-slate-100 px-4 py-3 hover:bg-brand-50"
                  onClick={() => {
                    markRead.mutate(notification.id)
                    setOpen(false)
                  }}
                >
                  {content}
                </Link>
              ) : (
                <button
                  key={notification.id}
                  type="button"
                  className="block w-full border-b border-slate-100 px-4 py-3 text-left hover:bg-brand-50"
                  onClick={() => markRead.mutate(notification.id)}
                >
                  {content}
                </button>
              )
            })}
            {listQuery.data?.empty && <p className="p-6 text-center text-sm text-ink-600">Bạn đã đọc hết thông báo.</p>}
          </div>
          <Link className="block px-4 py-3 text-center text-sm font-semibold text-brand-700 hover:bg-slate-50" to="/notifications" onClick={() => setOpen(false)}>
            Xem tất cả thông báo
          </Link>
        </section>
      )}
    </div>
  )
}
