import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TableHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'
import { ChevronLeft, ChevronRight, Circle, X } from 'lucide-react'
import type { ListingStatus } from '@/types/domain'

function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
}

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    'border-accent-600 bg-accent-600 text-white shadow-[0_10px_24px_rgb(3_105_161/0.18)] hover:border-accent-700 hover:bg-accent-700',
  secondary:
    'border-brand-200 bg-white/90 text-ink-950 shadow-sm hover:border-brand-500 hover:bg-brand-50',
  ghost: 'border-transparent bg-transparent text-ink-800 hover:bg-brand-50 hover:text-brand-800',
  danger: 'border-red-700 bg-red-700 text-white shadow-sm hover:bg-red-800',
}

const buttonSizes: Record<ButtonSize, string> = {
  sm: 'min-h-11 min-w-11 px-3 text-sm',
  md: 'min-h-12 min-w-11 px-4 text-sm',
  lg: 'min-h-[3.25rem] min-w-11 px-6 text-base',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled,
    children,
    type = 'button',
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl border font-bold transition duration-200 hover:-translate-y-0.5 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-55',
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
      {...props}
    >
      {loading && (
        <span
          className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  )
})

interface FieldShellProps {
  id: string
  label: string
  required?: boolean
  hint?: string
  error?: string
  children: ReactNode
}

function FieldShell({ id, label, required, hint, error, children }: FieldShellProps) {
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-sm font-bold text-ink-800">
        {label}
        {required && (
          <span className="ml-1 text-red-700" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {hint && (
        <p id={`${id}-hint`} className="text-xs text-ink-600">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-sm font-medium text-red-700" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

interface CommonFieldProps {
  label: string
  hint?: string
  error?: string
}

export type InputProps = CommonFieldProps & InputHTMLAttributes<HTMLInputElement>

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { id: providedId, label, hint, error, className, required, ...props },
  ref,
) {
  const generatedId = useId()
  const id = providedId ?? generatedId
  const describedBy =
    [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required}>
      <input
        ref={ref}
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          'min-h-12 w-full rounded-xl border bg-white/95 px-3.5 text-ink-950 shadow-sm outline-none transition duration-200 placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-100',
          error ? 'border-red-600' : 'border-brand-200 hover:border-brand-500',
          className,
        )}
        {...props}
      />
    </FieldShell>
  )
})

export type SelectProps = CommonFieldProps & SelectHTMLAttributes<HTMLSelectElement>

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { id: providedId, label, hint, error, className, required, children, ...props },
  ref,
) {
  const generatedId = useId()
  const id = providedId ?? generatedId
  const describedBy =
    [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required}>
      <select
        ref={ref}
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          'min-h-12 w-full rounded-xl border bg-white/95 px-3.5 text-ink-950 shadow-sm outline-none transition duration-200 disabled:cursor-not-allowed disabled:bg-slate-100',
          error ? 'border-red-600' : 'border-brand-200 hover:border-brand-500',
          className,
        )}
        {...props}
      >
        {children}
      </select>
    </FieldShell>
  )
})

export type TextareaProps = CommonFieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { id: providedId, label, hint, error, className, required, rows = 5, ...props },
  ref,
) {
  const generatedId = useId()
  const id = providedId ?? generatedId
  const describedBy =
    [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required}>
      <textarea
        ref={ref}
        id={id}
        rows={rows}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          'w-full resize-y rounded-xl border bg-white/95 px-3.5 py-3 text-ink-950 shadow-sm outline-none transition duration-200 placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-100',
          error ? 'border-red-600' : 'border-brand-200 hover:border-brand-500',
          className,
        )}
        {...props}
      />
    </FieldShell>
  )
})

type BadgeVariant = 'neutral' | 'info' | 'success' | 'warning' | 'danger'

const statusPresentation: Record<ListingStatus, { label: string; variant: BadgeVariant }> = {
  DRAFT: { label: 'Bản nháp', variant: 'neutral' },
  PENDING: { label: 'Chờ duyệt', variant: 'warning' },
  ACTIVE: { label: 'Đang hiển thị', variant: 'success' },
  REJECTED: { label: 'Bị từ chối', variant: 'danger' },
  INACTIVE: { label: 'Đã ngừng', variant: 'neutral' },
  EXPIRED: { label: 'Đã hết hạn', variant: 'neutral' },
  REMOVED: { label: 'Đã bị gỡ', variant: 'danger' },
}

const badgeVariants: Record<BadgeVariant, string> = {
  neutral: 'border-slate-200 bg-slate-100 text-slate-700',
  info: 'border-sky-200 bg-sky-50 text-sky-800',
  success: 'border-brand-200 bg-brand-50 text-brand-800',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  danger: 'border-red-200 bg-red-50 text-red-800',
}

export function Badge({
  status,
  variant = 'neutral',
  children,
  className,
}: {
  status?: ListingStatus
  variant?: BadgeVariant
  children?: ReactNode
  className?: string
}) {
  const presentation = status ? statusPresentation[status] : null
  const activeVariant = presentation?.variant ?? variant
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold',
        badgeVariants[activeVariant],
        className,
      )}
    >
      <Circle className="size-2 fill-current" aria-hidden="true" />
      {presentation?.label ?? children}
    </span>
  )
}

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-card)] border border-brand-100 bg-white/95 shadow-[var(--shadow-card)]',
        className,
      )}
      {...props}
    />
  )
}

export interface ModalProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}

export function Modal({ open, title, onClose, children, footer }: ModalProps) {
  const titleId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (event.key !== 'Tab' || !dialogRef.current) return
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      )
      if (focusable.length === 0) {
        event.preventDefault()
        dialogRef.current.focus()
        return
      }
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement
      if (event.shiftKey && (active === first || active === dialogRef.current)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (active === last || active === dialogRef.current)) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    dialogRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      previouslyFocused?.focus()
    }
  }, [onClose, open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-ink-950/55 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-[var(--radius-dialog)] border border-brand-100 bg-white shadow-[var(--shadow-dialog)] outline-none"
      >
        <div className="flex items-center justify-between border-b border-brand-100 bg-brand-50/60 px-5 py-4">
          <h2 id={titleId} className="text-lg font-bold text-ink-950">
            {title}
          </h2>
          <Button variant="ghost" size="sm" aria-label="Đóng hộp thoại" onClick={onClose}>
            <X className="size-5" aria-hidden="true" />
          </Button>
        </div>
        <div className="px-5 py-5">{children}</div>
        {footer && (
          <div className="flex flex-wrap justify-end gap-3 border-t border-brand-100 bg-slate-50/70 px-5 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export function Table({ className, children, ...props }: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto rounded-[var(--radius-card)] border border-brand-100 bg-white shadow-[var(--shadow-card)]">
      <table className={cn('w-full border-collapse text-left text-sm', className)} {...props}>
        {children}
      </table>
    </div>
  )
}

export const TableHeader = (props: HTMLAttributes<HTMLTableSectionElement>) => (
  <thead className="bg-brand-50/80 text-ink-800" {...props} />
)
export const TableBody = (props: HTMLAttributes<HTMLTableSectionElement>) => (
  <tbody className="divide-y divide-brand-100" {...props} />
)
export const TableRow = (props: HTMLAttributes<HTMLTableRowElement>) => (
  <tr className="transition-colors hover:bg-brand-50/55" {...props} />
)
export const TableHead = (props: HTMLAttributes<HTMLTableCellElement>) => (
  <th className="px-4 py-3.5 font-bold" scope="col" {...props} />
)
export const TableCell = (props: HTMLAttributes<HTMLTableCellElement>) => (
  <td className="px-4 py-3.5 text-ink-700" {...props} />
)

export interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  disabled?: boolean
}

export function Pagination({ page, totalPages, onPageChange, disabled = false }: PaginationProps) {
  if (totalPages <= 1) return null
  const currentPage = Math.min(Math.max(page, 0), totalPages - 1)
  return (
    <nav className="flex items-center justify-between gap-3" aria-label="Phân trang">
      <Button
        variant="secondary"
        size="sm"
        disabled={disabled || currentPage === 0}
        aria-label="Trang trước"
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
        <span className="hidden sm:inline">Trước</span>
      </Button>
      <span className="text-sm font-medium text-ink-600" aria-live="polite">
        Trang {currentPage + 1} / {totalPages}
      </span>
      <Button
        variant="secondary"
        size="sm"
        disabled={disabled || currentPage >= totalPages - 1}
        aria-label="Trang sau"
        onClick={() => onPageChange(currentPage + 1)}
      >
        <span className="hidden sm:inline">Sau</span>
        <ChevronRight className="size-4" aria-hidden="true" />
      </Button>
    </nav>
  )
}
