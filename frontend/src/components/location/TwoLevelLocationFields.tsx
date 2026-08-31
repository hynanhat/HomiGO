import { Button, Select } from '@/components/ui'
import { useCommuneUnits, useProvinces } from '@/features/locations/locationQueries'

interface LocationValue {
  provinceCode?: string
  communeCode?: string
}

interface Props {
  value: LocationValue
  onChange: (changes: LocationValue) => void
  errors?: { provinceCode?: string; communeCode?: string }
  required?: boolean
  provinceEmptyLabel?: string
  communeEmptyLabel?: string
  className?: string
}

export function TwoLevelLocationFields({
  value,
  onChange,
  errors = {},
  required = true,
  provinceEmptyLabel = 'Chọn tỉnh/thành phố',
  communeEmptyLabel = 'Chọn phường/xã/đặc khu',
  className = 'grid gap-4 md:grid-cols-2',
}: Props) {
  const provinces = useProvinces()
  const communes = useCommuneUnits(value.provinceCode)

  return (
    <div className={className}>
      <Select
        label="Tỉnh / thành phố"
        required={required}
        error={errors.provinceCode}
        disabled={provinces.isPending}
        value={value.provinceCode ?? ''}
        onChange={(event) =>
          onChange({ provinceCode: event.target.value || undefined, communeCode: undefined })
        }
      >
        <option value="">
          {provinces.isPending ? 'Đang tải tỉnh/thành phố…' : provinceEmptyLabel}
        </option>
        {provinces.data?.content.map((item) => (
          <option key={item.code} value={item.code}>
            {item.name}
          </option>
        ))}
      </Select>

      <Select
        label="Phường / xã / đặc khu"
        required={required}
        error={errors.communeCode}
        disabled={!value.provinceCode || communes.isPending || communes.isError}
        value={value.communeCode ?? ''}
        onChange={(event) =>
          onChange({
            provinceCode: value.provinceCode,
            communeCode: event.target.value || undefined,
          })
        }
      >
        <option value="">
          {!value.provinceCode
            ? 'Chọn tỉnh/thành phố trước'
            : communes.isPending
              ? 'Đang tải phường/xã/đặc khu…'
              : communeEmptyLabel}
        </option>
        {communes.data?.content.map((item) => (
          <option key={item.code} value={item.code}>
            {item.name}
          </option>
        ))}
      </Select>

      {provinces.isError && (
        <div className="md:col-span-2" role="alert">
          <p className="text-sm text-red-700">Không thể tải danh sách tỉnh/thành phố.</p>
          <Button type="button" size="sm" variant="secondary" onClick={() => provinces.refetch()}>
            Thử lại
          </Button>
        </div>
      )}
      {value.provinceCode && communes.isError && (
        <div className="md:col-span-2" role="alert">
          <p className="text-sm text-red-700">Không thể tải danh sách phường/xã/đặc khu.</p>
          <Button type="button" size="sm" variant="secondary" onClick={() => communes.refetch()}>
            Thử lại
          </Button>
        </div>
      )}
      {(provinces.isPending || communes.isPending) && (
        <span className="sr-only" role="status" aria-live="polite">
          Đang tải danh mục địa chỉ
        </span>
      )}
    </div>
  )
}
