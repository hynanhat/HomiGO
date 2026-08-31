import { useEffect, useRef, useState } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import { Button, Input, Select } from '@/components/ui'
import { TwoLevelLocationFields } from '@/components/location/TwoLevelLocationFields'
import { useCategories } from '@/features/categories/categoryQueries'
import type { ListingSearchState } from '@/types/domain'

interface Props {
  value: ListingSearchState
  onChange: (updates: Partial<ListingSearchState>) => void
}
const optionalNumber = (value: string) => (value === '' ? undefined : Number(value))
function Fields({ value, onChange }: Props) {
  const categories = useCategories()
  return (
    <div className="grid gap-4">
      <Input
        label="Từ khóa"
        value={value.keyword ?? ''}
        onChange={(event) => onChange({ keyword: event.target.value || undefined })}
        placeholder="Quận, dự án, đường…"
      />
      <Select
        label="Nhu cầu"
        value={value.transactionType ?? ''}
        onChange={(event) =>
          onChange({
            transactionType: (event.target.value ||
              undefined) as ListingSearchState['transactionType'],
          })
        }
      >
        <option value="">Tất cả</option>
        <option value="BUY">Mua bán</option>
        <option value="RENT">Cho thuê</option>
      </Select>
      <Select
        label="Danh mục"
        value={value.categoryId ?? ''}
        onChange={(event) => onChange({ categoryId: optionalNumber(event.target.value) })}
      >
        <option value="">Tất cả danh mục</option>
        {categories.data?.content.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </Select>
      <TwoLevelLocationFields
        required={false}
        className="grid gap-4"
        value={value}
        provinceEmptyLabel="Toàn quốc"
        communeEmptyLabel="Tất cả phường/xã/đặc khu"
        onChange={(location) =>
          onChange({
            provinceCode: location.provinceCode,
            communeCode: location.communeCode,
          })
        }
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Giá từ"
          type="number"
          min="0"
          value={value.minPrice ?? ''}
          onChange={(event) => onChange({ minPrice: optionalNumber(event.target.value) })}
        />
        <Input
          label="Giá đến"
          type="number"
          min="0"
          value={value.maxPrice ?? ''}
          onChange={(event) => onChange({ maxPrice: optionalNumber(event.target.value) })}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Diện tích từ"
          type="number"
          min="0"
          value={value.minArea ?? ''}
          onChange={(event) => onChange({ minArea: optionalNumber(event.target.value) })}
        />
        <Input
          label="Diện tích đến"
          type="number"
          min="0"
          value={value.maxArea ?? ''}
          onChange={(event) => onChange({ maxArea: optionalNumber(event.target.value) })}
        />
      </div>
    </div>
  )
}
export function ListingFilterPanel(props: Props) {
  return (
    <aside className="rounded-3xl border border-brand-100 bg-white/85 p-5 shadow-[var(--shadow-card)] backdrop-blur">
      <p className="eyebrow mb-2">Thu hẹp kết quả</p>
      <h2 className="mb-5 text-xl font-bold">Bộ lọc tìm kiếm</h2>
      <Fields {...props} />
    </aside>
  )
}
export function ListingFilterDrawer(props: Props) {
  const [open, setOpen] = useState(false)
  const trigger = useRef<HTMLButtonElement>(null)
  const close = useRef<HTMLButtonElement>(null)
  const dismiss = () => {
    setOpen(false)
    trigger.current?.focus()
  }
  useEffect(() => {
    if (!open) return
    close.current?.focus()
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') dismiss()
    }
    document.addEventListener('keydown', key)
    return () => document.removeEventListener('keydown', key)
  }, [open])
  return (
    <div className="lg:hidden">
      <Button ref={trigger} variant="secondary" className="w-full" onClick={() => setOpen(true)}>
        <SlidersHorizontal className="size-4" aria-hidden="true" />
        Bộ lọc
      </Button>
      {open && (
        <div
          className="fixed inset-0 z-50 bg-ink-950/55 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => event.target === event.currentTarget && dismiss()}
        >
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Bộ lọc tìm kiếm"
            className="ml-auto h-full w-[min(24rem,92vw)] overflow-y-auto border-l border-brand-100 bg-white p-5 shadow-2xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold">Bộ lọc</h2>
              <button
                ref={close}
                type="button"
                className="grid size-11 place-items-center rounded-xl hover:bg-brand-50"
                aria-label="Đóng bộ lọc"
                onClick={dismiss}
              >
                <X aria-hidden="true" />
              </button>
            </div>
            <Fields {...props} />
            <Button className="mt-6 w-full" onClick={dismiss}>
              Xem kết quả
            </Button>
          </aside>
        </div>
      )}
    </div>
  )
}
