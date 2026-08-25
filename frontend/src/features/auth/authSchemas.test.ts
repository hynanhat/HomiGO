import { describe, expect, it } from 'vitest'
import { passwordSchema, registerSchema } from './authSchemas'

describe('auth schemas', () => {
  it('requires a 12-to-72-character new password', () => {
    expect(passwordSchema.safeParse({
      currentPassword: 'old-password',
      newPassword: 'too-short',
      confirmPassword: 'too-short',
    }).success).toBe(false)

    expect(registerSchema.safeParse({
      name: 'Nguyễn An',
      email: 'an@example.com',
      password: 'correct-horse',
      confirmPassword: 'correct-horse',
      phone: '',
    }).success).toBe(true)
  })
})
