export interface ApiResponse<T> {
  success: boolean
  data: T
  message: string
  errorCode: string | null
}

export interface PageResponse<T> {
  content: T[]
  number: number
  size: number
  totalElements: number
  totalPages: number
  numberOfElements: number
  first: boolean
  last: boolean
  empty: boolean
}

export interface PaginationParams {
  page?: number
  size?: number
}

export type ApiFieldErrors = Record<string, string>

export interface ApiErrorPayload {
  success?: false
  data?: ApiFieldErrors | null
  message?: string
  errorCode?: string | null
}
