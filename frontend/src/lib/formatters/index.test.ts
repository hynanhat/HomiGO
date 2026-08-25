import { describe, expect, it } from 'vitest'
import { formatAddress, formatArea, formatCurrency, formatDate, formatProjectStatus } from './index'

describe('Vietnamese formatters', () => {
  it('formats currency and area for Vietnamese readers', () => {
    expect(formatCurrency(1_250_000_000)).toContain('1.250.000.000')
    expect(formatCurrency(1_250_000_000)).toContain('₫')
    expect(formatArea(85.5)).toBe('85,5 m²')
  })

  it('returns a safe placeholder for absent numeric values', () => {
    expect(formatCurrency(undefined)).toBe('—')
    expect(formatArea(Number.NaN)).toBe('—')
  })

  it('formats valid dates and rejects invalid dates', () => {
    expect(formatDate('2026-08-15T00:00:00Z')).toMatch(/15\/08\/2026/)
    expect(formatDate('not-a-date')).toBe('—')
  })

  it('builds a compact address without empty or duplicate segments', () => {
    expect(formatAddress({
      address: '12 Nguyễn Huệ',
      wardName: 'Bến Nghé',
      districtName: 'Quận 1',
      provinceName: 'TP.HCM',
    })).toBe('12 Nguyễn Huệ, Bến Nghé, Quận 1, TP.HCM')
    expect(formatAddress({ districtName: 'Quận 1', provinceName: 'Quận 1' })).toBe('Quận 1')
  })

  it('translates project statuses', () => {
    expect(formatProjectStatus('IN_PROGRESS')).toBe('Đang triển khai')
    expect(formatProjectStatus(undefined)).toBe('—')
  })
})
