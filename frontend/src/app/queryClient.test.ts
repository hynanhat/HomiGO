import { describe, expect, it } from 'vitest'
import { ApiError } from '@/lib/api/apiError'
import { createAppQueryClient } from './queryClient'

describe('createAppQueryClient', () => {
  it('uses bounded retries and stable browser cache defaults', () => {
    const client = createAppQueryClient()
    const defaults = client.getDefaultOptions()

    expect(defaults.queries).toMatchObject({
      staleTime: 30_000,
      gcTime: 300_000,
      refetchOnWindowFocus: false,
    })
    expect(defaults.mutations?.retry).toBe(false)

    const retry = defaults.queries?.retry
    expect(typeof retry).toBe('function')
    if (typeof retry !== 'function') throw new Error('Retry policy is not configured.')

    expect(retry(0, new ApiError({ message: 'Dữ liệu không hợp lệ', retryable: false }))).toBe(
      false,
    )
    expect(retry(0, new Error('Lỗi tạm thời'))).toBe(true)
    expect(retry(1, new Error('Lỗi tạm thời'))).toBe(true)
    expect(retry(2, new Error('Lỗi tạm thời'))).toBe(false)
  })
})
