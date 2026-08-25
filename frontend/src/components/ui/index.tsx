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
  primary: 'border-brand-600 bg-brand-600 text-white hover:bg-brand-700',
  secondary: 'border-slate-300 bg-white text-ink-950 hover:border-slate-400 hover:bg-slate-50',
  ghost: 'border-transparent bg-transparent text-ink-800 hover:bg-slate-100',
  danger: 'border-red-700 bg-red-700 text-white hover:bg-red-800',
}

const buttonSizes: Record<ButtonSize, string> = {
  sm: 'min-h-9 px-3 text-sm',
  md: 'min-h-11 px-4 text-sm',
  lg: 'min-h-12 px-5 text-base',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', size = 'md', loading = false, disabled, children, type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg border font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-55',
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
      {...props}
    >
      {loading && <span className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden="true" />}
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
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-ink-800">
        {label}{required && <span className="ml-1 text-red-700" aria-hidden="true">*</span>}
      </label>
      {children}
      {hint && <p id={`${id}-hint`} className="text-xs text-ink-600">{hint}</p>}
      {error && <p id={`${id}-error`} className="text-sm font-medium text-red-700" role="alert">{error}</p>}
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
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required}>
      <input
        ref={ref}
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          'min-h-11 w-full rounded-lg border bg-white px-3 text-ink-950 shadow-sm outline-none transition placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-100',
          error ? 'border-red-600' : 'border-slate-300 hover:border-slate-400',
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
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required}>
      <select
        ref={ref}
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          'min-h-11 w-full rounded-lg border bg-white px-3 text-ink-950 shadow-sm outline-none transition disabled:cursor-not-allowed disabled:bg-slate-100',
          error ? 'border-red-600' : 'border-slate-300 hover:border-slate-400',
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
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined
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
          'w-full resize-y rounded-lg border bg-white px-3 py-2.5 text-ink-950 shadow-sm outline-none transition placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-100',
          error ? 'border-red-600' : 'border-slate-300 hover:border-slate-400',
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
}

const badgeVariants: Record<BadgeVariant, string> = {
  neutral: 'bg-slate-100 text-slate-700',
  info: 'bg-blue-50 text-blue-800',
  success: 'bg-emerald-50 text-emerald-800',
  warning: 'bg-amber-50 text-amber-900',
  danger: 'bg-red-50 text-red-800',
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
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold', badgeVariants[activeVariant], className)}>
      <Circle className="size-2 fill-current" aria-hidden="true" />
      {presentation?.label ?? children}
    </span>
  )
}

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-xl border border-slate-200 bg-white shadow-[var(--shadow-card)]', className)} {...props} />
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
      if (event.key === 'Escape') onClose()
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
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 p-4" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose()
    }}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-2xl bg-white shadow-[var(--shadow-dialog)] outline-none"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 id={titleId} className="text-lg font-bold text-ink-950">{title}</h2>
          <Button variant="ghost" size="sm" aria-label="Đóng hộp thoại" onClick={onClose}>
            <X className="size-5" aria-hidden="true" />
          </Button>
        </div>
        <div className="px-5 py-5">{children}</div>
        {footer && <div className="flex justify-end gap-3 border-t border-slate-200 px-5 py-4">{footer}</div>}
      </div>
    </div>
  )
}

export function Table({ className, children, ...props }: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className={cn('w-full border-collapse text-left text-sm', className)} {...props}>{children}</table>
    </div>
  )
}

export const TableHeader = (props: HTMLAttributes<HTMLTableSectionElement>) => <thead className="bg-slate-50 text-ink-800" {...props} />
export const TableBody = (props: HTMLAttributes<HTMLTableSectionElement>) => <tbody className="divide-y divide-slate-200" {...props} />
export const TableRow = (props: HTMLAttributes<HTMLTableRowElement>) => <tr className="transition-colors hover:bg-slate-50" {...props} />
export const TableHead = (props: HTMLAttributes<HTMLTableCellElement>) => <th className="px-4 py-3 font-semibold" scope="col" {...props} />
export const TableCell = (props: HTMLAttributes<HTMLTableCellElement>) => <td className="px-4 py-3 text-slate-700" {...props} />

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
