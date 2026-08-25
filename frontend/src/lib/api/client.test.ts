import { http, HttpResponse } from 'msw'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { server } from '../../../tests/mocks/server'
import { apiClient, configureApiAuth } from './client'

afterEach(() => configureApiAuth(null))
describe('API refresh coordination', () => {
  it('performs one refresh for concurrent 401 responses and retries with rotated token', async () => {
    let token = 'old'; const refresh = vi.fn(async () => { token = 'rotated'; return token }); const expired = vi.fn()
    configureApiAuth({ getAccessToken: () => token, refreshAccessToken: refresh, onSessionExpired: expired })
    server.use(http.get('*/api/v1/protected-test', ({ request }) => request.headers.get('authorization') === 'Bearer rotated' ? HttpResponse.json({ success: true, data: 'ok', message: 'OK', errorCode: null }) : HttpResponse.json({ success: false, data: null, message: 'Expired', errorCode: 'UNAUTHORIZED' }, { status: 401 })))
    await expect(Promise.all([apiClient.get('/protected-test'), apiClient.get('/protected-test')])).resolves.toEqual(['ok', 'ok'])
    expect(refresh).toHaveBeenCalledTimes(1); expect(expired).not.toHaveBeenCalled()
  })
  it('terminates a revoked session without a request loop', async () => {
    const expired = vi.fn(); const refresh = vi.fn(async () => null)
    configureApiAuth({ getAccessToken: () => 'old', refreshAccessToken: refresh, onSessionExpired: expired })
    server.use(http.get('*/api/v1/revoked-test', () => HttpResponse.json({ success: false, data: null, message: 'Revoked', errorCode: 'UNAUTHORIZED' }, { status: 401 })))
    await expect(apiClient.get('/revoked-test')).rejects.toMatchObject({ status: 401 })
    expect(refresh).toHaveBeenCalledTimes(1); expect(expired).toHaveBeenCalledTimes(1)
  })
})
