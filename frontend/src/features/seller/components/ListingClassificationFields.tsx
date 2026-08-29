import { useState } from 'react'
import { Select } from '@/components/ui'
import { useCategories } from '@/features/categories/categoryQueries'
import { useDistricts, useProvinces, useWards } from '@/features/locations/locationQueries'
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
  const [provinceId, setProvinceId] = useState<number>()
  const categories = useCategories()
  const provinces = useProvinces()
  const districts = useDistricts(provinceId)
  const wards = useWards(value.districtId || undefined)
  const projects = useProjectSearch({ page: 0, size: 100 })
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
      <Select
        label="Tỉnh / thành phố"
        value={provinceId ?? ''}
        onChange={(event) => {
          const id = Number(event.target.value) || undefined
          setProvinceId(id)
          onChange({ districtId: 0, wardId: undefined, projectId: undefined })
        }}
      >
        <option value="">Chọn tỉnh/thành</option>
        {provinces.data?.content.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </Select>
      <Select
        label="Quận / huyện"
        required
        error={errors.districtId}
        disabled={!provinceId}
        value={value.districtId || ''}
        onChange={(event) =>
          onChange({
            districtId: Number(event.target.value),
            wardId: undefined,
            projectId: undefined,
          })
        }
      >
        <option value="">Chọn quận/huyện</option>
        {districts.data?.content.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </Select>
      <Select
        label="Phường / xã"
        disabled={!value.districtId}
        value={value.wardId ?? ''}
        onChange={(event) => onChange({ wardId: Number(event.target.value) || undefined })}
      >
        <option value="">Không chọn</option>
        {wards.data?.content.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </Select>
      <Select
        label="Dự án"
        value={value.projectId ?? ''}
        onChange={(event) => onChange({ projectId: Number(event.target.value) || undefined })}
      >
        <option value="">Không thuộc dự án</option>
        {projects.data?.content
          .filter((item) => !value.districtId || item.districtId === value.districtId)
          .map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
      </Select>
    </fieldset>
  )
}
