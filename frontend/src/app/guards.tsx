import type { PropsWithChildren, ReactNode } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import type { UserRole } from '@/types/domain'

function RestoringSession() {
  return (
    <main className="grid min-h-[50vh] place-items-center" aria-busy="true">
      <p className="text-sm text-slate-600">Đang khôi phục phiên đăng nhập…</p>
    </main>
  )
}

function GuardOutlet({ children }: PropsWithChildren): ReactNode {
  return children ?? <Outlet />
}

export function AnonymousRoute({ children }: PropsWithChildren) {
  const { status } = useAuth()
  if (status === 'restoring') return <RestoringSession />
  if (status === 'authenticated') return <Navigate to="/" replace />
  return <GuardOutlet>{children}</GuardOutlet>
}

export function AuthenticatedRoute({ children }: PropsWithChildren) {
  const { status } = useAuth()
  const location = useLocation()
  if (status === 'restoring') return <RestoringSession />
  if (status !== 'authenticated') {
    const destination = `${location.pathname}${location.search}${location.hash}`
    return <Navigate to="/auth/login" replace state={{ from: destination }} />
  }
  return <GuardOutlet>{children}</GuardOutlet>
}

function RoleRoute({ role, children }: PropsWithChildren<{ role: UserRole }>) {
  const { status, user } = useAuth()
  const location = useLocation()
  if (status === 'restoring') return <RestoringSession />
  if (status !== 'authenticated') {
    return (
      <Navigate
        to="/auth/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    )
  }
  if (user?.role !== role) return <Navigate to="/access-denied" replace />
  return <GuardOutlet>{children}</GuardOutlet>
}

export function SellerRoute({ children }: PropsWithChildren) {
  const { status, user } = useAuth()
  const location = useLocation()
  if (status === 'restoring') return <RestoringSession />
  if (status !== 'authenticated') {
    return (
      <Navigate
        to="/auth/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    )
  }
  if (user?.role === 'USER') return <Navigate to="/seller/upgrade" replace />
  if (user?.role !== 'SELLER') return <Navigate to="/" replace state={{ accessDenied: true }} />
  return <GuardOutlet>{children}</GuardOutlet>
}

export function AdminRoute({ children }: PropsWithChildren) {
  return <RoleRoute role="ADMIN">{children}</RoleRoute>
}
