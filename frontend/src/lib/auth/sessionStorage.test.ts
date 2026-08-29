import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  broadcastSessionLogout,
  clearPersistedSession,
  getSessionStorageKey,
} from './sessionStorage'

describe('session persistence', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.restoreAllMocks()
  })

  it('removes refresh tokens left by an older application version', () => {
    window.localStorage.setItem('homigo.session.v1', JSON.stringify({ refreshToken: 'secret' }))

    clearPersistedSession()

    expect(window.localStorage.getItem('homigo.session.v1')).toBeNull()
  })

  it('broadcasts logout without putting bearer credentials in storage', () => {
    vi.spyOn(crypto, 'randomUUID').mockReturnValue('00000000-0000-4000-8000-000000000001')

    broadcastSessionLogout()

    expect(window.localStorage.getItem(getSessionStorageKey())).toBe(
      '00000000-0000-4000-8000-000000000001',
    )
    expect(window.localStorage.getItem('homigo.session.v1')).toBeNull()
  })
})
