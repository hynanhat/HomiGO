import { apiClient, requestRefreshSession, requestSessionLogout } from '@/lib/api/client'
import type { AuthTokens } from '@/types/domain'
import type { LoginRequest, LoginResponse, PasswordChangeRequest, ProfileResponse, ProfileUpdateRequest, RefreshResponse, RegisterRequest, RegisterResponse } from './authTypes'

export const registerAccount = (request: RegisterRequest) => apiClient.post<RegisterResponse>('/auth/register', request)
export const loginAccount = (request: LoginRequest) => apiClient.post<LoginResponse>('/auth/login', request)
export const refreshSession = (): Promise<RefreshResponse> => requestRefreshSession()
export const logoutSession = (accessToken: string | null) => requestSessionLogout(accessToken)
export const getProfile = () => apiClient.get<ProfileResponse>('/users/me')
export const updateProfile = (request: ProfileUpdateRequest) => apiClient.put<ProfileResponse>('/users/me', request)
export const changePassword = (request: PasswordChangeRequest) => apiClient.put<void>('/auth/password', request)
export type { AuthTokens }
