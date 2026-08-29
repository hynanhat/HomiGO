import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '../../../tests/mocks/server'
import { changePassword, getProfile, loginAccount, registerAccount, updateProfile } from './authApi'

describe('auth and account API contracts', () => {
  it('uses backend field names for login and register', async () => {
    server.use(
      http.post('*/api/v1/auth/register', async ({ request }) => {
        expect(await request.json()).toEqual({
          name: 'An',
          email: 'an@test.vn',
          password: 'correct-horse',
          phone: '0901234567',
        })
        return HttpResponse.json({
          success: true,
          data: { id: 1, name: 'An', email: 'an@test.vn', role: 'USER' },
          message: 'OK',
          errorCode: null,
        })
      }),
    )
    await registerAccount({
      name: 'An',
      email: 'an@test.vn',
      password: 'correct-horse',
      phone: '0901234567',
    })
    expect(
      (await loginAccount({ email: 'an@homigo.vn', password: 'secret1' })).accessToken,
    ).toBeTruthy()
  })
  it('supports profile and password operations', async () => {
    expect((await getProfile()).role).toBe('USER')
    expect((await updateProfile({ name: 'Tên mới', phone: '0901234567' })).name).toBe('Tên mới')
    await expect(
      changePassword({ currentPassword: 'secret1', newPassword: 'new-correct-horse' }),
    ).resolves.toBeNull()
  })
})
