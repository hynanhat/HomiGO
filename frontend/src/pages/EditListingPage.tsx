import { useNavigate, useParams } from 'react-router-dom'
import { Button, Card } from '@/components/ui'
import { ErrorState, Skeleton, useToast } from '@/components/feedback'
import { ListingForm } from '@/features/seller/components/ListingForm'
import { useSellerListing, useUpdateSellerListing } from '@/features/seller/sellerListingQueries'
import type { ListingFormValues } from '@/features/seller/sellerTypes'
import { ApiError, getSafeErrorMessage } from '@/lib/api/apiError'

export default function EditListingPage() {
  const id = Number(useParams().id); const query = useSellerListing(id); const update = useUpdateSellerListing(id); const navigate = useNavigate(); const { showToast } = useToast()
  if (query.isPending) return <Skeleton className="h-96" />
  if (query.isError || !query.data) return <ErrorState onRetry={() => query.refetch()} />
  const item = query.data; const initial: ListingFormValues = { categoryId: item.categoryId ?? 0, districtId: item.districtId ?? 0, wardId: item.wardId ?? undefined, projectId: item.projectId ?? undefined, title: item.title, description: item.description, price: item.price, area: item.area, address: item.address, latitude: item.latitude ?? undefined, longitude: item.longitude ?? undefined, bedrooms: item.bedrooms ?? undefined, bathrooms: item.bathrooms ?? undefined, floors: item.floors ?? undefined, direction: item.direction ?? undefined, furnishing: item.furnishing ?? undefined, legalStatus: item.legalStatus ?? undefined, contactName: item.contactName, contactPhone: item.contactPhone, version: item.version }
  const submit = async (values: ListingFormValues) => { try { await update.mutateAsync(values); showToast({ type: 'success', title: 'Đã cập nhật tin đăng', description: item.status === 'ACTIVE' ? 'Tin đang hiển thị sẽ chuyển về chờ duyệt.' : undefined }); navigate(`/seller/listings/${id}`) } catch (error) { if (error instanceof ApiError && error.status === 409) { showToast({ type: 'warning', title: 'Tin đã được thay đổi ở nơi khác', description: 'Hãy tải lại phiên bản mới trước khi tiếp tục.' }); return } showToast({ type: 'error', title: 'Không thể cập nhật', description: getSafeErrorMessage(error) }) } }
  return <Card className="p-6"><div className="flex justify-between gap-3"><div><h2 className="text-2xl font-bold">Chỉnh sửa tin đăng</h2><p className="mt-1 text-sm text-ink-600">Phiên bản hiện tại: {item.version}</p></div><Button variant="secondary" onClick={() => query.refetch()}>Tải lại</Button></div><div className="mt-7"><ListingForm key={item.version} initialValue={initial} submitLabel="Lưu thay đổi" submitting={update.isPending} onSubmit={submit} /></div></Card>
}
