import { useMemo, useRef, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { Button, Card, Textarea } from '@/components/ui'
import { getSafeErrorMessage, toApiError } from '@/lib/api/apiError'
import { useAiDescriptionQuota, useGenerateAiDescription } from '../aiDescriptionQueries'
import { toAiDescriptionRequest } from '../aiDescriptionTypes'
import type { ListingFormValues } from '../sellerTypes'

const relevantSnapshot = (listing: ListingFormValues) => JSON.stringify({
  categoryId: listing.categoryId,
  districtId: listing.districtId,
  wardId: listing.wardId,
  projectId: listing.projectId,
  title: listing.title,
  price: listing.price,
  area: listing.area,
  address: listing.address,
  bedrooms: listing.bedrooms,
  bathrooms: listing.bathrooms,
  floors: listing.floors,
  direction: listing.direction,
  furnishing: listing.furnishing,
  legalStatus: listing.legalStatus,
})

function formatTime(value: string | null | undefined): string | null {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit',
  }).format(date)
}

function validate(listing: ListingFormValues, keywords: string): string | null {
  const length = [...keywords.trim()].length
  if (length < 3 || length > 500) return 'Nhập từ khóa từ 3 đến 500 ký tự.'
  if (!listing.categoryId) return 'Chọn loại bất động sản trước khi tạo mô tả.'
  if (!listing.districtId) return 'Chọn quận/huyện trước khi tạo mô tả.'
  if (!(listing.price > 0)) return 'Nhập giá hợp lệ trước khi tạo mô tả.'
  if (!(listing.area > 0)) return 'Nhập diện tích hợp lệ trước khi tạo mô tả.'
  return null
}

export function AiDescriptionAssistant({ listing, onApply }: {
  listing: ListingFormValues
  onApply: (description: string) => void
}) {
  const quotaQuery = useAiDescriptionQuota()
  const generation = useGenerateAiDescription()
  const [keywords, setKeywords] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [generatedFrom, setGeneratedFrom] = useState<string | null>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const currentSnapshot = useMemo(() => relevantSnapshot(listing), [listing])
  const quota = generation.data?.quota ?? quotaQuery.data
  const exhausted = Boolean(quota && quota.remainingAttempts <= 0)
  const temporarilyReserved = Boolean(quota && quota.availableNow <= 0 && quota.remainingAttempts > 0)
  const disabled = generation.isPending || !quota?.enabled || exhausted || temporarilyReserved
  const stalePreview = Boolean(preview && generatedFrom && generatedFrom !== currentSnapshot)

  const generate = async () => {
    const validationMessage = validate(listing, keywords)
    if (validationMessage) { setMessage(validationMessage); return }
    if (preview && !window.confirm('Tạo lại sẽ thay thế bản xem trước hiện tại. Bạn muốn tiếp tục?')) return
    setMessage(null)
    try {
      const draft = await generation.mutateAsync(toAiDescriptionRequest(listing, keywords))
      setPreview(draft.description)
      setGeneratedFrom(currentSnapshot)
      requestAnimationFrame(() => previewRef.current?.focus())
    } catch (error) {
      const apiError = toApiError(error)
      if (apiError.errorCode === 'AI_DAILY_LIMIT_REACHED') setMessage('Bạn đã dùng hết 5 lượt hôm nay. Hạn mức sẽ được đặt lại vào ngày mai.')
      else if (apiError.errorCode === 'AI_QUOTA_TEMPORARILY_RESERVED') setMessage('Các lượt đang được xử lý. Vui lòng chờ một lát rồi thử lại.')
      else setMessage(getSafeErrorMessage(error, 'Chưa thể tạo mô tả. Bạn vẫn có thể nhập mô tả thủ công.'))
    }
  }

  const apply = () => {
    if (!preview) return
    if (listing.description.trim() && listing.description !== preview
      && !window.confirm('Áp dụng sẽ thay thế mô tả bạn đang nhập. Bạn muốn tiếp tục?')) return
    onApply(preview)
    setPreview(null)
    setGeneratedFrom(null)
    setMessage('Đã áp dụng mô tả AI. Bạn có thể chỉnh sửa trước khi lưu tin.')
  }

  const resetTime = formatTime(quota?.resetAt)
  const retryTime = formatTime(quota?.retryAt)

  return <Card className="grid gap-4 border-violet-200 bg-violet-50/40 p-4">
    <div className="flex flex-wrap items-start justify-between gap-2">
      <div>
        <h3 className="flex items-center gap-2 font-bold text-ink-950"><Sparkles className="size-4 text-violet-700" aria-hidden="true" />Viết mô tả bằng AI</h3>
        <p className="mt-1 text-sm text-ink-600">AI kết hợp từ khóa với thông tin form. Hãy kiểm tra nội dung trước khi đăng.</p>
      </div>
      {quota && <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-violet-800" aria-live="polite">
        Còn {quota.remainingAttempts}/{quota.limit} lượt hôm nay
      </span>}
    </div>

    <Textarea
      label="Từ khóa nổi bật"
      hint="Ví dụ: gần trường học, ban công thoáng, nội thất mới, phù hợp gia đình"
      value={keywords}
      minLength={3}
      maxLength={500}
      rows={3}
      disabled={!quota?.enabled || exhausted}
      onChange={(event) => setKeywords(event.target.value)}
    />

    {quotaQuery.isLoading && <p className="text-sm text-ink-600">Đang kiểm tra hạn mức AI…</p>}
    {quotaQuery.isError && <p className="text-sm text-red-700" role="alert">Không thể kiểm tra hạn mức AI. Bạn vẫn có thể nhập mô tả thủ công.</p>}
    {quota && !quota.enabled && <p className="text-sm text-amber-800" role="status">Tính năng AI đang tạm ngưng. Bạn vẫn có thể nhập mô tả thủ công.</p>}
    {exhausted && <p className="text-sm text-amber-800" role="status">Đã hết 5 lượt hôm nay{resetTime ? `; đặt lại lúc ${resetTime}` : ''}.</p>}
    {temporarilyReserved && <p className="text-sm text-amber-800" role="status">Các lượt đang được xử lý{retryTime ? `; thử lại sau ${retryTime}` : '; vui lòng thử lại sau'}.</p>}
    {message && <p className="text-sm font-medium text-ink-800" role="status" aria-live="polite">{message}</p>}

    <div><Button type="button" size="sm" loading={generation.isPending} disabled={disabled || quotaQuery.isLoading} onClick={generate}>
      <Sparkles className="size-4" aria-hidden="true" />{preview ? 'Tạo lại mô tả' : 'Tạo mô tả'}
    </Button></div>

    {preview && <div ref={previewRef} tabIndex={-1} className="grid gap-3 rounded-lg border border-violet-200 bg-white p-4 outline-none focus:ring-2 focus:ring-violet-500">
      <div>
        <h4 className="font-bold text-ink-950">Bản xem trước</h4>
        {stalePreview && <p className="mt-1 text-sm text-amber-800" role="alert">Thông tin form đã thay đổi sau khi tạo. Hãy tạo lại để mô tả chính xác hơn.</p>}
      </div>
      <p className="whitespace-pre-line text-sm leading-6 text-ink-800">{preview}</p>
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" onClick={apply}>Áp dụng vào mô tả</Button>
        <Button type="button" size="sm" variant="secondary" onClick={() => { setPreview(null); setGeneratedFrom(null) }}>Hủy bản xem trước</Button>
      </div>
    </div>}
  </Card>
}
