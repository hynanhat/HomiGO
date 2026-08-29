/* oxlint-disable react/only-export-components */
import {
  Component,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ErrorInfo,
  type HTMLAttributes,
  type PropsWithChildren,
  type ReactNode,
} from 'react'
import { AlertCircle, CheckCircle2, Inbox, Info, TriangleAlert, X } from 'lucide-react'
import { Button } from '@/components/ui'

type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastMessage {
  id: number
  type: ToastType
  title: string
  description?: string
  duration?: number
}

interface ToastContextValue {
  showToast: (toast: Omit<ToastMessage, 'id'>) => number
  dismissToast: (id: number) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

const toastPresentation = {
  success: { icon: CheckCircle2, className: 'border-emerald-200 text-emerald-900' },
  error: { icon: AlertCircle, className: 'border-red-200 text-red-900' },
  warning: { icon: TriangleAlert, className: 'border-amber-200 text-amber-950' },
  info: { icon: Info, className: 'border-blue-200 text-blue-900' },
}

export function ToastProvider({ children }: PropsWithChildren) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const nextId = useRef(0)

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(
    (toast: Omit<ToastMessage, 'id'>) => {
      const id = ++nextId.current
      setToasts((current) => [...current, { ...toast, id }])
      window.setTimeout(() => dismissToast(id), toast.duration ?? 4_500)
      return id
    },
    [dismissToast],
  )

  const value = useMemo(() => ({ showToast, dismissToast }), [dismissToast, showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="fixed right-4 top-4 z-[70] grid w-[min(24rem,calc(100vw_-_2rem))] gap-3"
        aria-label="Thông báo"
      >
        {toasts.map((toast) => {
          const presentation = toastPresentation[toast.type]
          const Icon = presentation.icon
          return (
            <div
              key={toast.id}
              role={toast.type === 'error' ? 'alert' : 'status'}
              className={`flex gap-3 rounded-2xl border bg-white/95 p-4 shadow-[var(--shadow-dialog)] backdrop-blur ${presentation.className}`}
            >
              <Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{toast.title}</p>
                {toast.description && (
                  <p className="mt-1 text-sm opacity-85">{toast.description}</p>
                )}
              </div>
              <button
                type="button"
                className="grid size-11 shrink-0 place-items-center self-start rounded-xl transition hover:bg-slate-100"
                aria-label="Đóng thông báo"
                onClick={() => dismissToast(toast.id)}
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context
}

export function Skeleton({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="status"
      aria-label="Đang tải nội dung"
      className={`animate-pulse rounded-2xl bg-brand-100/80 ${className}`}
      {...props}
    />
  )
}

export function EmptyState({
  title = 'Chưa có dữ liệu',
  description = 'Nội dung sẽ xuất hiện tại đây khi có dữ liệu phù hợp.',
  action,
}: {
  title?: string
  description?: string
  action?: ReactNode
}) {
  return (
    <section className="grid place-items-center rounded-3xl border border-dashed border-brand-300 bg-white/80 px-6 py-14 text-center shadow-[var(--shadow-card)] backdrop-blur">
      <span className="grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
        <Inbox className="size-7" aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-lg font-bold text-ink-950">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-ink-600">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </section>
  )
}

export function ErrorState({
  title = 'Không thể tải dữ liệu',
  description = 'Vui lòng thử lại sau ít phút.',
  onRetry,
}: {
  title?: string
  description?: string
  onRetry?: () => void
}) {
  return (
    <section
      className="grid place-items-center rounded-3xl border border-red-200 bg-red-50 px-6 py-14 text-center shadow-[var(--shadow-card)]"
      role="alert"
    >
      <TriangleAlert className="size-10 text-red-700" aria-hidden="true" />
      <h2 className="mt-4 text-lg font-bold text-red-950">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-red-800">{description}</p>
      {onRetry && (
        <Button className="mt-5" variant="secondary" onClick={onRetry}>
          Thử lại
        </Button>
      )}
    </section>
  )
}

interface ErrorBoundaryState {
  hasError: boolean
}

export class ErrorBoundary extends Component<PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(_error: Error, _info: ErrorInfo): void {
    // A production telemetry adapter can be connected here without exposing details to users.
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="mx-auto grid min-h-[60vh] max-w-3xl place-items-center px-4">
          <ErrorState
            title="Trang gặp sự cố"
            description="HomiGO không thể hiển thị trang này. Bạn có thể tải lại để tiếp tục."
            onRetry={() => window.location.reload()}
          />
        </main>
      )
    }
    return this.props.children
  }
}
