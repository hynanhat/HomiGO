import { useState } from 'react'
import { Badge, Button, Card, Modal, Pagination } from '@/components/ui'
import { ErrorState, Skeleton, useToast } from '@/components/feedback'
import { TwoLevelLocationFields } from '@/components/location/TwoLevelLocationFields'
import { AdminDataTable } from '@/features/admin/components/AdminDataTable'
import {
  PINNED_ADMINISTRATIVE_DATASET_VERSION,
  PINNED_PRODUCTION_CATEGORY_VERSION,
  type AdministrativeDatasetRelease,
  type AdministrativeDatasetStatus,
} from '@/features/admin/adminApi'
import {
  useActivateAdministrativeDataset,
  useAdministrativeDatasets,
  useInitializeProductionCategories,
  useValidateAdministrativeDataset,
} from '@/features/admin/adminQueries'
import { useCommuneUnits, useProvinces } from '@/features/locations/locationQueries'
import { getSafeErrorMessage } from '@/lib/api/apiError'
import { formatDate } from '@/lib/formatters'
import type { CommuneUnitOption, ProvinceOption } from '@/types/domain'

const PINNED_AUTHORITY = 'Cục Thống kê'
const PINNED_DOCUMENT = 'Quyết định 19/2025/QĐ-TTg ngày 30/06/2025'
const PINNED_EFFECTIVE_DATE = '2025-07-01'
const EXPECTED_PROVINCES = 34
const EXPECTED_COMMUNES = 3_321

const statusPresentation: Record<
  AdministrativeDatasetStatus,
  { label: string; variant: 'neutral' | 'success' | 'warning' | 'danger' }
> = {
  STAGED: { label: 'Chờ kiểm tra', variant: 'neutral' },
  VALIDATED: { label: 'Đã kiểm tra', variant: 'warning' },
  ACTIVE: { label: 'Đang hoạt động', variant: 'success' },
  FAILED: { label: 'Kiểm tra thất bại', variant: 'danger' },
  SUPERSEDED: { label: 'Đã được thay thế', variant: 'neutral' },
}

function DatasetStatusBadge({ status }: { status?: AdministrativeDatasetStatus }) {
  if (!status) return <Badge>Chưa kiểm tra</Badge>
  const presentation = statusPresentation[status]
  return <Badge variant={presentation.variant}>{presentation.label}</Badge>
}

export default function LocationManagementPage() {
  const [provinceCode, setProvinceCode] = useState<string>()
  const [communeCode, setCommuneCode] = useState<string>()
  const [datasetPage, setDatasetPage] = useState(0)
  const [confirmingActivation, setConfirmingActivation] = useState(false)
  const [operationStatus, setOperationStatus] = useState<{
    type: 'success' | 'error'
    message: string
  }>()

  const datasets = useAdministrativeDatasets(datasetPage)
  const validateDataset = useValidateAdministrativeDataset()
  const activateDataset = useActivateAdministrativeDataset()
  const initializeCategories = useInitializeProductionCategories()
  const provinces = useProvinces()
  const communes = useCommuneUnits(provinceCode)
  const { showToast } = useToast()

  const listedPinnedRelease = datasets.data?.content.find(
    (release) => release.datasetVersion === PINNED_ADMINISTRATIVE_DATASET_VERSION,
  )
  const pinnedRelease =
    (activateDataset.data?.datasetVersion === PINNED_ADMINISTRATIVE_DATASET_VERSION
      ? activateDataset.data
      : undefined) ??
    (validateDataset.data?.datasetVersion === PINNED_ADMINISTRATIVE_DATASET_VERSION
      ? validateDataset.data
      : undefined) ??
    listedPinnedRelease
  const datasetBusy = validateDataset.isPending || activateDataset.isPending

  const validate = async () => {
    setOperationStatus(undefined)
    try {
      const release = await validateDataset.mutateAsync(PINNED_ADMINISTRATIVE_DATASET_VERSION)
      const message = `Đã kiểm tra ${release.actualProvinceCount ?? 0} tỉnh/thành phố và ${(
        release.actualCommuneCount ?? 0
      ).toLocaleString('vi-VN')} đơn vị cấp xã.`
      setOperationStatus({ type: 'success', message })
      showToast({ type: 'success', title: 'Bộ dữ liệu hợp lệ', description: message })
    } catch (error) {
      const message = getSafeErrorMessage(error, 'Không thể kiểm tra bộ dữ liệu đã ghim.')
      setOperationStatus({ type: 'error', message })
      showToast({ type: 'error', title: 'Kiểm tra thất bại', description: message })
    }
  }

  const activate = async () => {
    setOperationStatus(undefined)
    try {
      await activateDataset.mutateAsync(PINNED_ADMINISTRATIVE_DATASET_VERSION)
      const message = 'Bộ địa giới hai cấp đã được kích hoạt cho toàn hệ thống.'
      setOperationStatus({ type: 'success', message })
      showToast({ type: 'success', title: 'Đã kích hoạt bộ dữ liệu', description: message })
      setConfirmingActivation(false)
    } catch (error) {
      const message = getSafeErrorMessage(error, 'Không thể kích hoạt bộ dữ liệu đã ghim.')
      setOperationStatus({ type: 'error', message })
      showToast({ type: 'error', title: 'Kích hoạt thất bại', description: message })
    }
  }

  const initializeCategoryCatalog = async () => {
    setOperationStatus(undefined)
    try {
      const result = await initializeCategories.mutateAsync(PINNED_PRODUCTION_CATEGORY_VERSION)
      const message = `Catalog có ${result.total} danh mục: tạo mới ${result.created}, giữ nguyên ${result.unchanged}.`
      setOperationStatus({ type: 'success', message })
      showToast({ type: 'success', title: 'Đã khởi tạo danh mục production', description: message })
    } catch (error) {
      const message = getSafeErrorMessage(error, 'Không thể khởi tạo danh mục production.')
      setOperationStatus({ type: 'error', message })
      showToast({ type: 'error', title: 'Khởi tạo thất bại', description: message })
    }
  }

  const datasetColumns = [
    {
      key: 'version',
      header: 'Phiên bản',
      render: (item: AdministrativeDatasetRelease) => (
        <span className="font-mono text-xs font-semibold">{item.datasetVersion}</span>
      ),
    },
    {
      key: 'source',
      header: 'Nguồn',
      render: (item: AdministrativeDatasetRelease) => (
        <span>
          {item.authority}
          <span className="block text-xs text-ink-600">{item.documentNumber}</span>
        </span>
      ),
    },
    {
      key: 'counts',
      header: 'Số lượng',
      render: (item: AdministrativeDatasetRelease) =>
        `${item.actualProvinceCount ?? '—'}/${item.expectedProvinceCount} tỉnh · ${
          item.actualCommuneCount?.toLocaleString('vi-VN') ?? '—'
        }/${item.expectedCommuneCount.toLocaleString('vi-VN')} cấp xã`,
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (item: AdministrativeDatasetRelease) => <DatasetStatusBadge status={item.status} />,
    },
  ]
  const provinceColumns = [
    { key: 'code', header: 'Mã', render: (item: ProvinceOption) => item.code },
    { key: 'name', header: 'Tỉnh / thành phố', render: (item: ProvinceOption) => item.name },
    { key: 'type', header: 'Loại', render: (item: ProvinceOption) => item.type },
    { key: 'source', header: 'Nguồn', render: (item: ProvinceOption) => item.sourceVersion },
  ]
  const communeColumns = [
    { key: 'code', header: 'Mã', render: (item: CommuneUnitOption) => item.code },
    {
      key: 'name',
      header: 'Phường / xã / đặc khu',
      render: (item: CommuneUnitOption) => item.name,
    },
    { key: 'type', header: 'Loại', render: (item: CommuneUnitOption) => item.type },
    { key: 'source', header: 'Nguồn', render: (item: CommuneUnitOption) => item.sourceVersion },
  ]

  return (
    <div className="grid gap-8">
      <div>
        <h2 className="text-3xl font-extrabold">Danh mục địa giới hai cấp</h2>
        <p className="mt-2 max-w-3xl text-ink-600">
          Kiểm tra và kích hoạt dữ liệu hành chính chính thức trước khi sử dụng cho tin đăng và dự
          án.
        </p>
      </div>

      <section aria-labelledby="bootstrap-title" className="grid gap-5">
        <div>
          <p className="eyebrow">Khởi tạo production</p>
          <h3 id="bootstrap-title" className="mt-1 text-2xl font-bold">
            Bộ dữ liệu đã ghim
          </h3>
        </div>

        <Card className="p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink-600">Phiên bản địa giới</p>
              <p className="mt-1 break-all font-mono text-sm font-bold text-ink-950">
                {PINNED_ADMINISTRATIVE_DATASET_VERSION}
              </p>
            </div>
            <DatasetStatusBadge status={pinnedRelease?.status} />
          </div>

          <dl className="mt-5 grid gap-4 border-y border-brand-100 py-5 sm:grid-cols-2 xl:grid-cols-4">
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-ink-600">Nguồn</dt>
              <dd className="mt-1 font-semibold">{PINNED_AUTHORITY}</dd>
              <dd className="mt-1 text-sm text-ink-600">{PINNED_DOCUMENT}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-ink-600">Hiệu lực</dt>
              <dd className="mt-1 font-semibold">{formatDate(PINNED_EFFECTIVE_DATE)}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-ink-600">Tỉnh/thành</dt>
              <dd className="mt-1 text-xl font-extrabold tabular-nums">
                {pinnedRelease?.actualProvinceCount ?? '—'} / {EXPECTED_PROVINCES}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-ink-600">
                Đơn vị cấp xã
              </dt>
              <dd className="mt-1 text-xl font-extrabold tabular-nums">
                {pinnedRelease?.actualCommuneCount?.toLocaleString('vi-VN') ?? '—'} /{' '}
                {EXPECTED_COMMUNES.toLocaleString('vi-VN')}
              </dd>
            </div>
          </dl>

          {datasets.isError && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800" role="alert">
                Không thể tải trạng thái release. Bạn vẫn có thể kiểm tra lại bộ dữ liệu đã ghim.
              </p>
              <Button size="sm" variant="secondary" onClick={() => datasets.refetch()}>
                Tải lại trạng thái
              </Button>
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-3">
            <Button
              variant="secondary"
              loading={validateDataset.isPending}
              disabled={datasetBusy || pinnedRelease?.status === 'ACTIVE'}
              onClick={validate}
            >
              Kiểm tra bộ dữ liệu
            </Button>
            <Button
              loading={activateDataset.isPending}
              disabled={datasetBusy || pinnedRelease?.status !== 'VALIDATED'}
              onClick={() => setConfirmingActivation(true)}
            >
              {pinnedRelease?.status === 'ACTIVE' ? 'Đang hoạt động' : 'Kích hoạt bộ dữ liệu'}
            </Button>
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-ink-600">Catalog danh mục production</p>
              <p className="mt-1 font-mono text-sm font-bold">
                {PINNED_PRODUCTION_CATEGORY_VERSION}
              </p>
              <p className="mt-2 text-sm text-ink-600">
                Khởi tạo lặp lại an toàn 16 danh mục mua bán và cho thuê, không tạo tin đăng demo.
              </p>
            </div>
            <Button
              variant="secondary"
              loading={initializeCategories.isPending}
              onClick={initializeCategoryCatalog}
            >
              Khởi tạo 16 danh mục
            </Button>
          </div>
        </Card>

        {operationStatus && (
          <p
            className={`rounded-xl border p-4 text-sm font-medium ${
              operationStatus.type === 'error'
                ? 'border-red-200 bg-red-50 text-red-800'
                : 'border-brand-200 bg-brand-50 text-brand-800'
            }`}
            role={operationStatus.type === 'error' ? 'alert' : 'status'}
            aria-live={operationStatus.type === 'error' ? 'assertive' : 'polite'}
          >
            {operationStatus.message}
          </p>
        )}

        {datasets.isPending && <Skeleton className="h-40" />}
        {datasets.data && datasets.data.content.length > 0 && (
          <div className="grid gap-4">
            <AdminDataTable
              caption="Lịch sử release dữ liệu hành chính"
              columns={datasetColumns}
              rows={datasets.data.content}
              rowKey={(item) => item.datasetVersion}
            />
            <Pagination
              page={datasetPage}
              totalPages={datasets.data.totalPages}
              disabled={datasets.isFetching}
              onPageChange={setDatasetPage}
            />
          </div>
        )}
      </section>

      <section aria-labelledby="catalog-title" className="grid gap-5">
        <div>
          <h3 id="catalog-title" className="text-2xl font-bold">
            Địa giới đang hoạt động
          </h3>
          <p className="mt-1 text-ink-600">
            Tra cứu catalog hiện đang phục vụ biểu mẫu production.
          </p>
        </div>

        <Card className="p-5">
          <TwoLevelLocationFields
            required={false}
            value={{ provinceCode, communeCode }}
            provinceEmptyLabel="Chọn tỉnh/thành phố để kiểm tra"
            communeEmptyLabel="Tất cả phường/xã/đặc khu"
            onChange={(value) => {
              setProvinceCode(value.provinceCode)
              setCommuneCode(value.communeCode)
            }}
          />
        </Card>

        {provinces.isPending && <Skeleton className="h-56" />}
        {provinces.isError && (
          <ErrorState
            title="Chưa thể tải địa giới đang hoạt động"
            description="Hãy kích hoạt một release hợp lệ hoặc thử tải lại."
            onRetry={() => provinces.refetch()}
          />
        )}
        {provinces.data && !provinceCode && (
          <AdminDataTable
            caption="Danh sách tỉnh/thành phố hiện hành"
            columns={provinceColumns}
            rows={provinces.data.content}
            rowKey={(item) => item.code}
          />
        )}
        {provinceCode && communes.isPending && <Skeleton className="h-56" />}
        {provinceCode && communes.isError && (
          <ErrorState
            title="Không thể tải đơn vị cấp xã"
            description="Vui lòng thử lại sau ít phút."
            onRetry={() => communes.refetch()}
          />
        )}
        {provinceCode && communes.data && (
          <AdminDataTable
            caption="Danh sách phường/xã/đặc khu trực thuộc"
            columns={communeColumns}
            rows={communes.data.content}
            rowKey={(item) => item.code}
          />
        )}
      </section>

      <Modal
        open={confirmingActivation}
        title="Xác nhận kích hoạt dữ liệu địa giới"
        onClose={() => {
          if (!activateDataset.isPending) setConfirmingActivation(false)
        }}
        footer={
          <>
            <Button
              variant="secondary"
              disabled={activateDataset.isPending}
              onClick={() => setConfirmingActivation(false)}
            >
              Hủy
            </Button>
            <Button loading={activateDataset.isPending} onClick={activate}>
              Xác nhận kích hoạt
            </Button>
          </>
        }
      >
        <p className="leading-7 text-ink-700">
          Release <strong>{PINNED_ADMINISTRATIVE_DATASET_VERSION}</strong> sẽ trở thành nguồn địa
          giới đang hoạt động cho toàn bộ tin đăng, dự án và bộ lọc. Chỉ tiếp tục sau khi kết quả
          kiểm tra đủ {EXPECTED_PROVINCES} tỉnh/thành phố và{' '}
          {EXPECTED_COMMUNES.toLocaleString('vi-VN')} đơn vị cấp xã.
        </p>
      </Modal>
    </div>
  )
}
