import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getProfile, updateProfile } from '@/features/auth/authApi'

export const accountKeys = { profile: ['account', 'profile'] as const }
export function useProfile() {
  return useQuery({ queryKey: accountKeys.profile, queryFn: getProfile })
}
export function useUpdateProfile() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (profile) => client.setQueryData(accountKeys.profile, profile),
  })
}
