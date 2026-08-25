import { AxiosError } from 'axios'
import { describe, expect, it } from 'vitest'
import { ApiError, getSafeErrorMessage, toApiError } from './apiError'

function axiosError(status?: number, data?: unknown): AxiosError {
  return new AxiosError(
    'request failed',
    'ERR_BAD_RESPONSE',
    undefined,
    undefined,
    status ? { status, data, statusText: '', headers: {}, config: {} as never } : undefined,
  )
}

describe('ApiError', () => {
  it('preserves safe client messages and field errors', () => {
    const error = toApiError(axiosError(400, {
      message: 'Dữ liệu chưa hợp lệ.',
      errorCode: 'VALIDATION_ERROR',
      data: { email: 'Email không hợp lệ.' },
    }))

    expect(error).toBeInstanceOf(ApiError)
    expect(error.message).toBe('Dữ liệu chưa hợp lệ.')
    expect(error.errorCode).toBe('VALIDATION_ERROR')
    expect(error.fieldErrors.email).toBe('Email không hợp lệ.')
  })

  it('does not expose a server error message', () => {
    const error = toApiError(axiosError(500, { message: 'SQL connection details' }))
    expect(error.message).toBe('Hệ thống đang gặp sự cố. Vui lòng thử lại sau.')
    expect(error.retryable).toBe(true)
  })

  it('uses a Vietnamese network fallback', () => {
    expect(getSafeErrorMessage(axiosError())).toBe(
      'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối và thử lại.',
    )
  })

  it('keeps an already normalized error', () => {
    const original = new ApiError({ message: 'Đã chuẩn hóa.' })
    expect(toApiError(original)).toBe(original)
  })
})
