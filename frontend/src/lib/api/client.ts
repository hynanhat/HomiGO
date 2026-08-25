import axios, { type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios'
import type { ApiResponse } from '@/types/api'
import type { AuthSession } from '@/types/domain'
import { ApiError, toApiError } from './apiError'

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/$/, '')
const authPaths = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout']

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _homigoRetried?: boolean
}

export interface ApiAuthController {
  getAccessToken: () => string | null
  refreshAccessToken: () => Promise<string | null>
  onSessionExpired: () => void
}

export interface ApiClient {
  get<T>(url: string, config?: AxiosRequestConfig): Promise<T>
  post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>
  put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>
  patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>
  delete<T>(url: string, config?: AxiosRequestConfig): Promise<T>
}

const axiosInstance = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15_000,
  withCredentials: true,
})

const authTransport = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15_000,
  withCredentials: true,
})

let authController: ApiAuthController | null = null
let refreshPromise: Promise<string | null> | null = null

export function configureApiAuth(controller: ApiAuthController | null): void {
  authController = controller
}

axiosInstance.interceptors.request.use((config) => {
  const accessToken = authController?.getAccessToken()
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
  return config
})

axiosInstance.interceptors.response.use(
  (response) => {
    const payload = response.data as Partial<ApiResponse<unknown>> | undefined
    if (payload && typeof payload === 'object' && typeof payload.success === 'boolean' && 'data' in payload) {
      if (!payload.success) {
        throw new ApiError({
          message: payload.message || 'Yêu cầu không thành công.',
          errorCode: payload.errorCode ?? null,
          status: response.status,
        })
      }
      return payload.data
    }
    return response.data
  },
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) return Promise.reject(toApiError(error))

    const originalRequest = error.config as RetryableRequestConfig | undefined
    const isRefreshable = error.response?.status === 401
      && Boolean(originalRequest)
      && !originalRequest?._homigoRetried
      && !authPaths.some((path) => originalRequest?.url?.includes(path))
      && Boolean(authController)

    if (!isRefreshable || !originalRequest || !authController) {
      return Promise.reject(toApiError(error))
    }

    originalRequest._homigoRetried = true
    refreshPromise ??= authController.refreshAccessToken().finally(() => {
      refreshPromise = null
    })

    try {
      const accessToken = await refreshPromise
      if (!accessToken) throw toApiError(error)
      originalRequest.headers.Authorization = `Bearer ${accessToken}`
      return axiosInstance.request(originalRequest)
    } catch (refreshError) {
      authController.onSessionExpired()
      return Promise.reject(toApiError(refreshError))
    }
  },
)

export const apiClient = axiosInstance as unknown as ApiClient

export async function requestRefreshSession(): Promise<AuthSession> {
  try {
    const response = await authTransport.post<ApiResponse<AuthSession>>('/auth/refresh')
    return response.data.data
  } catch (error) {
    throw toApiError(error, 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
  }
}

export async function requestSessionLogout(accessToken: string | null): Promise<void> {
  try {
    await authTransport.post<ApiResponse<null>>(
      '/auth/logout',
      undefined,
      accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined,
    )
  } catch (error) {
    throw toApiError(error, 'Không thể thu hồi phiên trên máy chủ.')
  }
}
