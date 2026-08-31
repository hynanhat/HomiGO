/* oxlint-disable react/only-export-components */
import { useState, type FormEvent } from 'react'
import { Button, Input, Textarea } from '@/components/ui'
import { listingFormSchema } from '../listingFormSchema'
import type { ListingFormValues } from '../sellerTypes'
import { AiDescriptionAssistant } from './AiDescriptionAssistant'
import { ListingClassificationFields } from './ListingClassificationFields'

export const emptyListingForm: ListingFormValues = {
  categoryId: 0,
  provinceCode: '',
  communeCode: '',
  title: '',
  description: '',
  price: 0,
  area: 0,
  address: '',
  contactName: '',
  contactPhone: '',
}
const numberOrUndefined = (value: string) => (value === '' ? undefined : Number(value))
export function ListingForm({
  initialValue = emptyListingForm,
  submitting,
  submitLabel = 'Lưu bản nháp',
  onSubmit,
}: {
  initialValue?: ListingFormValues
  submitting?: boolean
  submitLabel?: string
  onSubmit: (value: ListingFormValues) => Promise<void> | void
}) {
  const [value, setValue] = useState(initialValue)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const change = (updates: Partial<ListingFormValues>) =>
    setValue((current) => ({ ...current, ...updates }))
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const result = listingFormSchema.safeParse(value)
    if (!result.success) {
      setErrors(
        Object.fromEntries(
          result.error.issues.map((issue) => [String(issue.path[0]), issue.message]),
        ),
      )
      return
    }
    setErrors({})
    await onSubmit(result.data)
  }
  return (
    <form className="grid gap-7" onSubmit={submit} noValidate>
      <ListingClassificationFields value={value} onChange={change} errors={errors} />
      <fieldset className="grid gap-4">
        <legend className="text-lg font-bold">Nội dung tin đăng</legend>
        <Input
          label="Tiêu đề"
          required
          maxLength={200}
          value={value.title}
          error={errors.title}
          onChange={(event) => change({ title: event.target.value })}
        />
        <AiDescriptionAssistant
          listing={value}
          onApply={(description) => change({ description })}
        />
        <Textarea
          label="Mô tả chi tiết"
          required
          maxLength={10000}
          value={value.description}
          error={errors.description}
          onChange={(event) => change({ description: event.target.value })}
        />
      </fieldset>
      <fieldset className="grid gap-4 md:grid-cols-2">
        <legend className="col-span-full text-lg font-bold">Giá và đặc điểm</legend>
        <Input
          label="Giá (VNĐ)"
          type="number"
          min="1"
          required
          value={value.price || ''}
          error={errors.price}
          onChange={(event) => change({ price: Number(event.target.value) })}
        />
        <Input
          label="Diện tích (m²)"
          type="number"
          min="0.1"
          step="0.1"
          required
          value={value.area || ''}
          error={errors.area}
          onChange={(event) => change({ area: Number(event.target.value) })}
        />
        <Input
          label="Phòng ngủ"
          type="number"
          min="0"
          value={value.bedrooms ?? ''}
          onChange={(event) => change({ bedrooms: numberOrUndefined(event.target.value) })}
        />
        <Input
          label="Phòng tắm"
          type="number"
          min="0"
          value={value.bathrooms ?? ''}
          onChange={(event) => change({ bathrooms: numberOrUndefined(event.target.value) })}
        />
        <Input
          label="Số tầng"
          type="number"
          min="0"
          value={value.floors ?? ''}
          onChange={(event) => change({ floors: numberOrUndefined(event.target.value) })}
        />
        <Input
          label="Hướng"
          value={value.direction ?? ''}
          onChange={(event) => change({ direction: event.target.value || undefined })}
        />
        <Input
          label="Nội thất"
          value={value.furnishing ?? ''}
          onChange={(event) => change({ furnishing: event.target.value || undefined })}
        />
        <Input
          label="Pháp lý"
          value={value.legalStatus ?? ''}
          onChange={(event) => change({ legalStatus: event.target.value || undefined })}
        />
      </fieldset>
      <fieldset className="grid gap-4 md:grid-cols-2">
        <legend className="col-span-full text-lg font-bold">Vị trí và liên hệ</legend>
        <div className="md:col-span-2">
          <Input
            label="Địa chỉ"
            required
            value={value.address}
            error={errors.address}
            onChange={(event) => change({ address: event.target.value })}
          />
        </div>
        <Input
          label="Vĩ độ"
          type="number"
          step="any"
          value={value.latitude ?? ''}
          error={errors.latitude}
          onChange={(event) => change({ latitude: numberOrUndefined(event.target.value) })}
        />
        <Input
          label="Kinh độ"
          type="number"
          step="any"
          value={value.longitude ?? ''}
          error={errors.longitude}
          onChange={(event) => change({ longitude: numberOrUndefined(event.target.value) })}
        />
        <Input
          label="Người liên hệ"
          required
          value={value.contactName}
          error={errors.contactName}
          onChange={(event) => change({ contactName: event.target.value })}
        />
        <Input
          label="Số điện thoại liên hệ"
          required
          value={value.contactPhone}
          error={errors.contactPhone}
          onChange={(event) => change({ contactPhone: event.target.value })}
        />
      </fieldset>
      <Button type="submit" size="lg" loading={submitting}>
        {submitLabel}
      </Button>
    </form>
  )
}
