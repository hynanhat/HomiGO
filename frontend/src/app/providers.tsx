import type { PropsWithChildren } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ErrorBoundary, ToastProvider } from '@/components/feedback'
import { AuthProvider } from '@/context/AuthContext'
import { queryClient } from './queryClient'

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <ErrorBoundary>{children}</ErrorBoundary>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
