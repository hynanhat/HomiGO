import { describe, expect, it } from 'vitest'
import { validateImageFiles } from './ListingImageUploader'
import type { ListingImageDraft } from '../sellerTypes'

const file = (name: string, type: string, size = 4) =>
  new File([new Uint8Array(size)], name, { type })
describe('listing image constraints', () => {
  it('rejects MIME, 5 MB overflow and duplicate selection', () => {
    const existing: ListingImageDraft[] = [
      {
        clientId: '1',
        file: file('a.webp', 'image/webp'),
        url: '',
        name: 'a.webp',
        contentType: 'image/webp',
        size: 4,
        status: 'local',
      },
    ]
    const result = validateImageFiles(
      [
        file('bad.gif', 'image/gif'),
        file('large.png', 'image/png', 5 * 1024 * 1024 + 1),
        file('a.webp', 'image/webp'),
      ],
      existing,
    )
    expect(result.valid).toHaveLength(0)
    expect(result.errors).toHaveLength(3)
  })
  it('enforces the ten-image limit', () => {
    const existing = Array.from({ length: 9 }, (_, index): ListingImageDraft => ({
      clientId: String(index),
      url: '',
      name: `${index}.webp`,
      contentType: 'image/webp',
      size: 1,
      status: 'uploaded',
    }))
    const result = validateImageFiles(
      [file('new-a.webp', 'image/webp'), file('new-b.webp', 'image/webp')],
      existing,
    )
    expect(result.valid).toHaveLength(1)
    expect(result.errors.join(' ')).toContain('10 ảnh')
  })
})
