/* oxlint-disable react/only-export-components */
import { useEffect, useRef, useState } from 'react'
import { ImagePlus, RotateCcw, Trash2, Upload } from 'lucide-react'
import { Button } from '@/components/ui'
import { getSafeErrorMessage } from '@/lib/api/apiError'
import { deleteListingImage, uploadListingImage } from '../sellerListingApi'
import type { ListingImageDraft } from '../sellerTypes'

const accepted = new Set(['image/jpeg', 'image/png', 'image/webp'])
const maxSize = 5 * 1024 * 1024
const maxImages = 10

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
  if (existing.length + valid.length > maxImages) {
    errors.push('Mỗi tin đăng chỉ được tối đa 10 ảnh.')
    valid.splice(Math.max(0, maxImages - existing.length))
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
      progress: 100,
    })),
  )
  const [errors, setErrors] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number } | null>(
    null,
  )
  const itemsRef = useRef(items)
  const inputRef = useRef<HTMLInputElement>(null)
  const uploadingRef = useRef(false)
  itemsRef.current = items

  useEffect(
    () => () =>
      itemsRef.current.forEach((item) => {
        if (item.file && item.url.startsWith('blob:')) URL.revokeObjectURL(item.url)
      }),
    [],
  )

  const removeLocal = (id: string) =>
    setItems((current) => {
      const target = current.find((item) => item.clientId === id)
      if (target?.file && target.url.startsWith('blob:')) URL.revokeObjectURL(target.url)
      return current.filter((item) => item.clientId !== id)
    })

  const removeItem = async (item: ListingImageDraft) => {
    if (uploadingRef.current) return
    if (!item.serverId) {
      removeLocal(item.clientId)
      return
    }
    try {
      await deleteListingImage(listingId, item.serverId)
      removeLocal(item.clientId)
    } catch (cause) {
      setErrors([getSafeErrorMessage(cause, 'Không thể xóa ảnh. Vui lòng thử lại.')])
    }
  }

  const select = (files: File[]) => {
    if (uploadingRef.current) return
    const result = validateImageFiles(files, itemsRef.current)
    setErrors(result.errors)
    setItems((current) => [
      ...current,
      ...result.valid.map((file) => ({
        clientId: crypto.randomUUID(),
        uploadId: crypto.randomUUID(),
        file,
        url: URL.createObjectURL(file),
        name: file.name,
        contentType: file.type,
        size: file.size,
        status: 'pending' as const,
        progress: 0,
      })),
    ])
  }

  const runUpload = async (onlyClientId?: string) => {
    if (uploadingRef.current) return
    uploadingRef.current = true
    setIsUploading(true)
    setErrors([])
    const batch = itemsRef.current.filter(
      (candidate) =>
        candidate.file &&
        candidate.uploadId &&
        (candidate.status === 'pending' || candidate.status === 'failed') &&
        (!onlyClientId || candidate.clientId === onlyClientId),
    )
    setBatchProgress({ current: 0, total: batch.length })

    try {
      for (let index = 0; index < batch.length; index += 1) {
        const item = batch[index]
        setBatchProgress({ current: index + 1, total: batch.length })
        setItems((current) =>
          current.map((candidate) =>
            candidate.clientId === item.clientId
              ? { ...candidate, status: 'uploading', progress: 0, error: undefined }
              : candidate,
          ),
        )
        try {
          const uploaded = await uploadListingImage(
            listingId,
            item.file!,
            item.uploadId!,
            (progress) =>
              setItems((current) =>
                current.map((candidate) =>
                  candidate.clientId === item.clientId ? { ...candidate, progress } : candidate,
                ),
              ),
          )
          if (item.url.startsWith('blob:')) URL.revokeObjectURL(item.url)
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
                    progress: 100,
                    file: undefined,
                    error: undefined,
                  }
                : candidate,
            ),
          )
        } catch (cause) {
          setItems((current) =>
            current.map((candidate) =>
              candidate.clientId === item.clientId
                ? {
                    ...candidate,
                    status: 'failed',
                    progress: 0,
                    error: getSafeErrorMessage(cause, 'Tải ảnh thất bại. Vui lòng thử lại.'),
                  }
                : candidate,
            ),
          )
        }
      }
    } finally {
      uploadingRef.current = false
      setIsUploading(false)
      setBatchProgress(null)
    }
  }

  const uploadableCount = items.filter(
    (item) => item.file && (item.status === 'pending' || item.status === 'failed'),
  ).length
  const remaining = Math.max(0, maxImages - items.length)

  return (
    <section aria-labelledby="listing-images-heading">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="listing-images-heading" className="text-xl font-bold">
            Hình ảnh
          </h2>
          <p className="mt-1 text-sm text-ink-600">
            JPEG, PNG hoặc WebP; tối đa 5 MB/ảnh; tối đa 10 ảnh.
          </p>
        </div>
        <p className="rounded-full bg-brand-50 px-3 py-1 text-sm font-bold text-brand-800">
          {items.length}/10 ảnh · còn {remaining} chỗ
        </p>
      </div>

      <label
        className={`mt-4 flex min-h-24 items-center justify-center gap-2 rounded-xl border border-dashed border-slate-400 p-6 font-semibold ${isUploading || remaining === 0 ? 'cursor-not-allowed opacity-55' : 'cursor-pointer hover:border-brand-500 hover:bg-brand-50'}`}
      >
        <ImagePlus className="size-5" aria-hidden="true" />
        Chọn nhiều ảnh
        <input
          ref={inputRef}
          className="sr-only"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={isUploading || remaining === 0}
          onChange={(event) => {
            const selected = Array.from(event.target.files ?? [])
            event.currentTarget.value = ''
            select(selected)
          }}
        />
      </label>

      <div aria-live="polite" className="mt-2 min-h-5 text-sm font-medium text-brand-800">
        {batchProgress && `Đang tải ảnh ${batchProgress.current}/${batchProgress.total}`}
      </div>
      {errors.map((error) => (
        <p key={error} role="alert" className="mt-2 text-sm text-red-700">
          {error}
        </p>
      ))}

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <article key={item.clientId} className="rounded-xl border border-slate-200 p-2">
            <img
              src={item.url}
              alt={item.name}
              className="aspect-square w-full rounded-lg bg-slate-100 object-cover"
            />
            <p className="mt-2 truncate text-xs font-semibold">{item.name}</p>
            <p
              className={`mt-1 text-xs ${item.status === 'failed' ? 'text-red-700' : 'text-ink-600'}`}
              role={item.status === 'failed' ? 'alert' : undefined}
            >
              {item.status === 'uploading'
                ? `Đang tải ${item.progress ?? 0}%`
                : item.status === 'failed'
                  ? item.error
                  : item.status === 'uploaded'
                    ? 'Đã tải'
                    : 'Chờ tải'}
            </p>
            {item.status === 'failed' && (
              <Button
                className="mt-2 w-full"
                size="sm"
                variant="secondary"
                disabled={isUploading}
                onClick={() => runUpload(item.clientId)}
              >
                <RotateCcw className="size-4" aria-hidden="true" />
                Thử lại
              </Button>
            )}
            <Button
              className="mt-2 w-full"
              size="sm"
              variant="ghost"
              disabled={isUploading}
              onClick={() => void removeItem(item)}
            >
              <Trash2 className="size-4" aria-hidden="true" />
              Xóa
            </Button>
          </article>
        ))}
      </div>

      {uploadableCount > 0 && (
        <Button className="mt-4" loading={isUploading} onClick={() => runUpload()}>
          <Upload className="size-4" aria-hidden="true" />
          Tải {uploadableCount} ảnh lên
        </Button>
      )}
    </section>
  )
}
