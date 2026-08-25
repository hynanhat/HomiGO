const SESSION_STORAGE_KEY = 'homigo.session.v1'
const LOGOUT_STORAGE_KEY = 'homigo.session.logout.v1'

export function clearPersistedSession(): void {
  // Remove sessions created by versions that stored bearer credentials in localStorage.
  window.localStorage.removeItem(SESSION_STORAGE_KEY)
}

export function getSessionStorageKey(): string {
  return LOGOUT_STORAGE_KEY
}

export function broadcastSessionLogout(): void {
  clearPersistedSession()
  window.localStorage.setItem(LOGOUT_STORAGE_KEY, crypto.randomUUID())
}
