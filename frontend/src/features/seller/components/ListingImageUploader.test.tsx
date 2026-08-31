import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ListingImageUploader, validateImageFiles } from './ListingImageUploader'
import type { ListingImageDraft } from '../sellerTypes'

const { uploadMock, deleteMock } = vi.hoisted(() => ({
  uploadMock: vi.fn(),
  deleteMock: vi.fn(),
}))

vi.mock('../sellerListingApi', () => ({
  uploadListingImage: uploadMock,
  deleteListingImage: deleteMock,
}))

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
        status: 'pending',
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

describe('listing image batch', () => {
  beforeEach(() => {
    uploadMock.mockReset()
    deleteMock.mockReset()
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: vi.fn((selected: File) => `blob:${selected.name}`),
    })
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: vi.fn(),
    })
  })

  it('uploads a multi-select once and retries only the failed image with the same upload id', async () => {
    let secondFileFailed = false
    uploadMock.mockImplementation(async (_id: number, selected: File) => {
      if (selected.name === 'second.webp' && !secondFileFailed) {
        secondFileFailed = true
        throw new Error('network')
      }
      return {
        id: selected.name === 'first.webp' ? 1 : selected.name === 'second.webp' ? 2 : 3,
        url: `/uploads/${selected.name}`,
        contentType: selected.type,
        sizeBytes: selected.size,
        sortOrder: 0,
      }
    })

    render(<ListingImageUploader listingId={101} />)
    const input = screen.getByLabelText('Chọn nhiều ảnh')
    fireEvent.change(input, {
      target: {
        files: [
          file('first.webp', 'image/webp'),
          file('second.webp', 'image/webp'),
          file('third.webp', 'image/webp'),
        ],
      },
    })

    expect(screen.getByText(/3\/10 ảnh/)).toBeInTheDocument()
    const uploadButton = screen.getByRole('button', { name: 'Tải 3 ảnh lên' })
    fireEvent.click(uploadButton)
    fireEvent.click(uploadButton)
    await waitFor(() => expect(uploadMock).toHaveBeenCalledTimes(3))
    expect(await screen.findByRole('button', { name: 'Thử lại' })).toBeInTheDocument()

    const failedUploadId = uploadMock.mock.calls.find(
      (call) => (call[1] as File).name === 'second.webp',
    )?.[2]
    fireEvent.click(screen.getByRole('button', { name: 'Thử lại' }))
    await waitFor(() => expect(uploadMock).toHaveBeenCalledTimes(4))
    const retriedCall = uploadMock.mock.calls.filter(
      (call) => (call[1] as File).name === 'second.webp',
    )[1]
    expect(retriedCall[2]).toBe(failedUploadId)
    expect(screen.getAllByText('Đã tải')).toHaveLength(3)
  })
})
