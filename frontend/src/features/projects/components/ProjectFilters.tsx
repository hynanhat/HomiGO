import { Input, Select } from '@/components/ui'
import { useDistricts, useProvinces } from '@/features/locations/locationQueries'
import type { ProjectSearchState } from '@/types/domain'

export function ProjectFilters({
  value,
  onChange,
}: {
  value: ProjectSearchState
  onChange: (updates: Partial<ProjectSearchState>) => void
}) {
  const provinces = useProvinces()
  const firstProvinceId = provinces.data?.content[0]?.id
  const districts = useDistricts(firstProvinceId)

  return (
    <section
      aria-label="Bộ lọc dự án"
      className="grid gap-4 rounded-3xl border border-brand-100 bg-white/85 p-5 shadow-[var(--shadow-card)] backdrop-blur md:grid-cols-3"
    >
      <Input
        label="Từ khóa"
        placeholder="Tên dự án hoặc chủ đầu tư"
        value={value.keyword ?? ''}
        onChange={(event) => onChange({ keyword: event.target.value || undefined })}
      />
      <Select
        label="Quận / huyện"
        value={value.districtId ?? ''}
        onChange={(event) =>
          onChange({ districtId: event.target.value ? Number(event.target.value) : undefined })
        }
      >
        <option value="">Tất cả khu vực</option>
        {districts.data?.content.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </Select>
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
