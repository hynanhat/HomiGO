import type { AuthSession, SessionUser, UserProfile } from '@/types/domain'

export interface LoginRequest {
  email: string
  password: string
}
export interface RegisterRequest {
  name: string
  email: string
  password: string
  phone?: string
}
export interface ProfileUpdateRequest {
  name: string
  phone?: string
}
export interface PasswordChangeRequest {
  currentPassword: string
  newPassword: string
}

export type LoginResponse = AuthSession
export type RegisterResponse = SessionUser
export type RefreshResponse = AuthSession
export type ProfileResponse = UserProfile
