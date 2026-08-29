/* oxlint-disable react/only-export-components */
import { useEffect, useRef, useState } from 'react'
import { ImagePlus, RotateCcw, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui'
import { deleteListingImage, uploadListingImage } from '../sellerListingApi'
import type { ListingImageDraft } from '../sellerTypes'

const accepted = new Set(['image/jpeg', 'image/png', 'image/webp'])
const maxSize = 5 * 1024 * 1024
export function validateImageFiles(files: File[], existing: ListingImageDraft[]) {
  const seen = new Set(existing.map((item) => `${item.name}:${item.size}:${item.contentType}`))
  const valid: File[] = []
  const errors: string[] = []
  for (const file of files) {
    const key = `${file.name}:${file.size}:${file.type}`
    if (!accepted.has(file.type)) errors.push(`${file.name}: chỉ chấp nhận JPEG, PNG hoặc WebP.`)
    else if (file.size > maxSize) errors.push(`${file.name}: vượt quá 5 MB.`)
    else if (seen.has(key)) errors.push(`${file.name}: ảnh đã được chọn.`)
    else {
      seen.add(key)
      valid.push(file)
    }
  }
  if (existing.length + valid.length > 10) {
    errors.push('Mỗi tin đăng chỉ được tối đa 10 ảnh.')
    valid.splice(Math.max(0, 10 - existing.length))
  }
  return { valid, errors }
}
export function ListingImageUploader({
  listingId,
  initialUrls = [],
  initialImageIds = [],
}: {
  listingId: number
  initialUrls?: string[]
  initialImageIds?: number[]
}) {
  const [items, setItems] = useState<ListingImageDraft[]>(() =>
    initialUrls.map((url, index) => ({
      clientId: `existing-${initialImageIds[index] ?? index}`,
      serverId: initialImageIds[index],
      url,
      name: `Ảnh ${index + 1}`,
      contentType: '',
      size: 0,
      status: 'uploaded',
    })),
  )
  const [errors, setErrors] = useState<string[]>([])
  const itemsRef = useRef(items)
  itemsRef.current = items
  useEffect(
    () => () =>
      itemsRef.current.forEach((item) => {
        if (item.file && item.url.startsWith('blob:')) URL.revokeObjectURL(item.url)
      }),
    [],
  )
  const remove = (id: string) =>
    setItems((current) => {
      const target = current.find((item) => item.clientId === id)
      if (target?.file && target.url.startsWith('blob:')) URL.revokeObjectURL(target.url)
      return current.filter((item) => item.clientId !== id)
    })
  const removeItem = async (item: ListingImageDraft) => {
    if (!item.serverId) {
      remove(item.clientId)
      return
    }
    try {
      await deleteListingImage(listingId, item.serverId)
      remove(item.clientId)
    } catch {
      setErrors(['Không thể xóa ảnh. Vui lòng thử lại.'])
    }
  }
  const select = (files: File[]) => {
    const result = validateImageFiles(files, items)
    setErrors(result.errors)
    setItems((current) => [
      ...current,
      ...result.valid.map((file) => ({
        clientId: crypto.randomUUID(),
        file,
        url: URL.createObjectURL(file),
        name: file.name,
        contentType: file.type,
        size: file.size,
        status: 'local' as const,
      })),
    ])
  }
  const upload = async () => {
    for (const item of items.filter(
      (candidate) => candidate.file && candidate.status !== 'uploaded',
    )) {
      setItems((current) =>
        current.map((candidate) =>
          candidate.clientId === item.clientId
            ? { ...candidate, status: 'uploading', error: undefined }
            : candidate,
        ),
      )
      try {
        const uploaded = await uploadListingImage(listingId, item.file!)
        setItems((current) =>
          current.map((candidate) =>
            candidate.clientId === item.clientId
              ? {
                  ...candidate,
                  serverId: uploaded.id,
                  url: uploaded.url,
                  contentType: uploaded.contentType,
                  size: uploaded.sizeBytes,
                  status: 'uploaded',
                  file: undefined,
                }
              : candidate,
          ),
        )
      } catch {
        setItems((current) =>
          current.map((candidate) =>
            candidate.clientId === item.clientId
              ? { ...candidate, status: 'failed', error: 'Tải lên thất bại.' }
              : candidate,
          ),
        )
      }
    }
  }
  return (
    <section>
      <h2 className="text-xl font-bold">Hình ảnh</h2>
      <p className="mt-1 text-sm text-ink-600">
        Tối đa 10 ảnh JPEG, PNG hoặc WebP; mỗi ảnh không quá 5 MB.
      </p>
      <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-400 p-6 font-semibold">
        <ImagePlus className="size-5" />
        Chọn ảnh
        <input
          className="sr-only"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={(event) => select(Array.from(event.target.files ?? []))}
        />
      </label>
      {errors.map((error) => (
        <p key={error} role="alert" className="mt-2 text-sm text-red-700">
          {error}
        </p>
      ))}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map((item) => (
          <div key={item.clientId} className="rounded-lg border p-2">
            <img
              src={item.url}
              alt={item.name}
              className="aspect-square w-full rounded object-cover"
            />
            <p className="mt-1 truncate text-xs">{item.name}</p>
            <p className="text-xs">
              {item.status === 'uploading'
                ? 'Đang tải…'
                : item.status === 'failed'
                  ? item.error
                  : item.status === 'uploaded'
                    ? 'Đã tải'
                    : 'Sẵn sàng'}
            </p>
            {(item.status !== 'uploaded' || item.serverId) && (
              <Button
                className="mt-2 w-full"
                size="sm"
                variant="ghost"
                onClick={() => void removeItem(item)}
              >
                <Trash2 className="size-4" />
                Xóa
              </Button>
            )}
          </div>
        ))}
      </div>
      {items.some((item) => item.file && item.status !== 'uploaded') && (
        <Button className="mt-4" onClick={upload}>
          <RotateCcw className="size-4" />
          Tải ảnh / thử lại
        </Button>
      )}
    </section>
  )
}
