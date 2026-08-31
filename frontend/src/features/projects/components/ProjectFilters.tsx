import { Input, Select } from '@/components/ui'
import { TwoLevelLocationFields } from '@/components/location/TwoLevelLocationFields'
import type { ProjectSearchState } from '@/types/domain'

export function ProjectFilters({
  value,
  onChange,
}: {
  value: ProjectSearchState
  onChange: (updates: Partial<ProjectSearchState>) => void
}) {
  return (
    <section
      aria-label="Bộ lọc dự án"
      className="grid gap-4 rounded-3xl border border-brand-100 bg-white/85 p-5 shadow-[var(--shadow-card)] backdrop-blur md:grid-cols-4"
    >
      <Input
        label="Từ khóa"
        placeholder="Tên dự án hoặc chủ đầu tư"
        value={value.keyword ?? ''}
        onChange={(event) => onChange({ keyword: event.target.value || undefined })}
      />
      <TwoLevelLocationFields
        required={false}
        className="grid gap-4 md:col-span-2 md:grid-cols-2"
        value={value}
        provinceEmptyLabel="Tất cả tỉnh/thành phố"
        communeEmptyLabel="Tất cả phường/xã/đặc khu"
        onChange={(location) =>
          onChange({
            provinceCode: location.provinceCode,
            communeCode: location.communeCode,
          })
        }
      />
      <Select
        label="Tiến độ"
        value={value.status ?? ''}
        onChange={(event) =>
          onChange({ status: (event.target.value || undefined) as ProjectSearchState['status'] })
        }
      >
        <option value="">Tất cả trạng thái</option>
        <option value="PLANNING">Đang quy hoạch</option>
        <option value="IN_PROGRESS">Đang triển khai</option>
        <option value="COMPLETED">Đã hoàn thành</option>
        <option value="ON_HOLD">Tạm dừng</option>
      </Select>
    </section>
  )
}
