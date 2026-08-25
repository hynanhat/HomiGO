import type { ProjectStatus } from '@/types/domain'

const EMPTY_VALUE = '—'

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
})

const numberFormatter = new Intl.NumberFormat('vi-VN', {
  maximumFractionDigits: 2,
})

const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

const projectStatusLabels: Record<ProjectStatus, string> = {
  PLANNING: 'Đang quy hoạch',
  IN_PROGRESS: 'Đang triển khai',
  COMPLETED: 'Đã hoàn thành',
  ON_HOLD: 'Tạm dừng',
}

export function formatCurrency(value: number | null | undefined): string {
  return typeof value === 'number' && Number.isFinite(value)
    ? currencyFormatter.format(value)
    : EMPTY_VALUE
}

export function formatArea(value: number | null | undefined): string {
  return typeof value === 'number' && Number.isFinite(value)
    ? `${numberFormatter.format(value)} m²`
    : EMPTY_VALUE
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return EMPTY_VALUE
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? EMPTY_VALUE : dateFormatter.format(date)
}

export interface AddressParts {
  address?: string | null
  wardName?: string | null
  districtName?: string | null
  provinceName?: string | null
}

export function formatAddress(parts: AddressParts): string {
  const uniqueParts = [parts.address, parts.wardName, parts.districtName, parts.provinceName]
    .map((part) => part?.trim())
    .filter((part, index, all): part is string => Boolean(part) && all.indexOf(part) === index)

  return uniqueParts.length > 0 ? uniqueParts.join(', ') : EMPTY_VALUE
}

export function formatProjectStatus(status: ProjectStatus | null | undefined): string {
  return status ? projectStatusLabels[status] : EMPTY_VALUE
}
