/* oxlint-disable react/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react'
import {
  configureApiAuth,
  requestRefreshSession,
  requestSessionLogout,
} from '@/lib/api/client'
import {
  broadcastSessionLogout,
  clearPersistedSession,
  getSessionStorageKey,
} from '@/lib/auth/sessionStorage'
import type { AuthSession, SessionState, SessionUser } from '@/types/domain'

interface AuthContextValue extends SessionState {
  token: string | null
  isAuthenticated: boolean
  login: (session: AuthSession) => void
  logout: () => Promise<void>
  refresh: () => Promise<string | null>
  updateUser: (user: SessionUser) => void
}

const initialState: SessionState = {
  user: null,
  accessToken: null,
  status: 'restoring',
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<SessionState>(initialState)
  const stateRef = useRef(state)
  const restoreStarted = useRef(false)

  useEffect(() => {
    stateRef.current = state
  }, [state])

  const terminateSession = useCallback(() => {
    clearPersistedSession()
    const nextState: SessionState = { user: null, accessToken: null, status: 'anonymous' }
    stateRef.current = nextState
    setState(nextState)
  }, [])

  const refresh = useCallback(async (): Promise<string | null> => {
    try {
      const rotateSession = async () => {
        const session = await requestRefreshSession()
        const nextState: SessionState = {
          user: session.user,
          accessToken: session.accessToken,
          status: 'authenticated',
        }
        stateRef.current = nextState
        setState(nextState)
        return session.accessToken
      }

      if (navigator.locks) {
        return await navigator.locks.request('homigo-refresh-token', rotateSession)
      }
      return await rotateSession()
    } catch {
      terminateSession()
      return null
    }
  }, [terminateSession])

  useEffect(() => {
    configureApiAuth({
      getAccessToken: () => stateRef.current.accessToken,
      refreshAccessToken: refresh,
      onSessionExpired: terminateSession,
    })
    return () => configureApiAuth(null)
  }, [refresh, terminateSession])

  useEffect(() => {
    if (restoreStarted.current) return
    restoreStarted.current = true
    void refresh()
  }, [refresh])

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === getSessionStorageKey() && !event.newValue) terminateSession()
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [terminateSession])

  const login = useCallback((session: AuthSession) => {
    const nextState: SessionState = {
      user: session.user,
      accessToken: session.accessToken,
      status: 'authenticated',
    }
    stateRef.current = nextState
    clearPersistedSession()
    setState(nextState)
  }, [])

  const logout = useCallback(async () => {
    const current = stateRef.current
    try {
      await requestSessionLogout(current.accessToken)
    } finally {
      broadcastSessionLogout()
      terminateSession()
    }
  }, [terminateSession])

  const updateUser = useCallback((user: SessionUser) => {
    setState((current) => {
      const next = { ...current, user }
      stateRef.current = next
      return next
    })
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    ...state,
    token: state.accessToken,
    isAuthenticated: state.status === 'authenticated',
    login,
    logout,
    refresh,
    updateUser,
  }), [login, logout, refresh, state, updateUser])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
