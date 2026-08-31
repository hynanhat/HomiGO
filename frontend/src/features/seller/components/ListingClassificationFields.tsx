import { TwoLevelLocationFields } from '@/components/location/TwoLevelLocationFields'
import { Select } from '@/components/ui'
import { useCategories } from '@/features/categories/categoryQueries'
import { useProjectSearch } from '@/features/projects/projectQueries'
import type { ListingFormValues } from '../sellerTypes'

export function ListingClassificationFields({
  value,
  onChange,
  errors = {},
}: {
  value: ListingFormValues
  onChange: (changes: Partial<ListingFormValues>) => void
  errors?: Record<string, string>
}) {
  const categories = useCategories()
  const projects = useProjectSearch({
    provinceCode: value.provinceCode || undefined,
    communeCode: value.communeCode || undefined,
    page: 0,
    size: 100,
  })

  return (
    <fieldset className="grid gap-4 md:grid-cols-2">
      <legend className="col-span-full text-lg font-bold">Phân loại và khu vực</legend>
      <Select
        label="Danh mục"
        required
        error={errors.categoryId}
        value={value.categoryId || ''}
        onChange={(event) => onChange({ categoryId: Number(event.target.value) })}
      >
        <option value="">Chọn danh mục</option>
        {categories.data?.content.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </Select>

      <div className="md:col-span-2">
        <TwoLevelLocationFields
          value={value}
          errors={{ provinceCode: errors.provinceCode, communeCode: errors.communeCode }}
          onChange={(changes) =>
            onChange({
              provinceCode: changes.provinceCode ?? '',
              communeCode: changes.communeCode ?? '',
              projectId: undefined,
            })
          }
        />
      </div>

      <Select
        label="Dự án"
        disabled={!value.communeCode}
        value={value.projectId ?? ''}
        onChange={(event) => onChange({ projectId: Number(event.target.value) || undefined })}
      >
        <option value="">Không thuộc dự án</option>
        {projects.data?.content.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </Select>
    </fieldset>
  )
}
