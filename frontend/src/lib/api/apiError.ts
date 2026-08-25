import axios from 'axios'
import type { ApiErrorPayload, ApiFieldErrors } from '@/types/api'

const NETWORK_MESSAGE = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối và thử lại.'
const SERVER_MESSAGE = 'Hệ thống đang gặp sự cố. Vui lòng thử lại sau.'
const DEFAULT_MESSAGE = 'Đã có lỗi xảy ra. Vui lòng thử lại.'

export class ApiError extends Error {
  readonly status: number | null
  readonly errorCode: string | null
  readonly fieldErrors: ApiFieldErrors
  readonly isNetworkError: boolean
  readonly retryable: boolean

  constructor(options: {
    message: string
    status?: number | null
    errorCode?: string | null
    fieldErrors?: ApiFieldErrors
    isNetworkError?: boolean
    retryable?: boolean
    cause?: unknown
  }) {
    super(options.message, { cause: options.cause })
    this.name = 'ApiError'
    this.status = options.status ?? null
    this.errorCode = options.errorCode ?? null
    this.fieldErrors = options.fieldErrors ?? {}
    this.isNetworkError = options.isNetworkError ?? false
    this.retryable = options.retryable ?? false
  }
}

function isFieldErrorMap(value: unknown): value is ApiFieldErrors {
  return Boolean(value)
    && typeof value === 'object'
    && !Array.isArray(value)
    && Object.values(value as Record<string, unknown>).every((item) => typeof item === 'string')
}

export function toApiError(error: unknown, fallbackMessage = DEFAULT_MESSAGE): ApiError {
  if (error instanceof ApiError) return error

  if (!axios.isAxiosError<ApiErrorPayload>(error)) {
    return new ApiError({ message: fallbackMessage, cause: error })
  }

  const status = error.response?.status ?? null
  const payload = error.response?.data
  const isNetworkError = !error.response
  const safeMessage = isNetworkError
    ? NETWORK_MESSAGE
    : status !== null && status >= 500
      ? SERVER_MESSAGE
      : payload?.message?.trim() || fallbackMessage

  return new ApiError({
    message: safeMessage,
    status,
    errorCode: payload?.errorCode ?? null,
    fieldErrors: isFieldErrorMap(payload?.data) ? payload.data : {},
    isNetworkError,
    retryable: isNetworkError || status === 408 || status === 429 || (status !== null && status >= 500),
    cause: error,
  })
}

export function getSafeErrorMessage(error: unknown, fallbackMessage = DEFAULT_MESSAGE): string {
  return toApiError(error, fallbackMessage).message
}
