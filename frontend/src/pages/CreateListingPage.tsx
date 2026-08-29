import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui'
import { useToast } from '@/components/feedback'
import { ListingForm } from '@/features/seller/components/ListingForm'
import { useCreateSellerListing } from '@/features/seller/sellerListingQueries'
import type { ListingFormValues } from '@/features/seller/sellerTypes'
import { getSafeErrorMessage } from '@/lib/api/apiError'

export default function CreateListingPage() {
  const create = useCreateSellerListing()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const submit = async (values: ListingFormValues) => {
    try {
      const listing = await create.mutateAsync(values)
      showToast({
        type: 'success',
        title: 'Đã lưu bản nháp',
        description: 'Hãy tải ảnh và kiểm tra trước khi gửi duyệt.',
      })
      navigate(`/seller/listings/${listing.id}`)
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Không thể lưu bản nháp',
        description: getSafeErrorMessage(error),
      })
    }
  }
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold">Tạo tin đăng mới</h2>
      <p className="mt-2 text-sm text-ink-600">
        Tin được lưu ở trạng thái bản nháp trước khi bạn tải ảnh và gửi duyệt.
      </p>
      <div className="mt-7">
        <ListingForm submitting={create.isPending} onSubmit={submit} />
      </div>
    </Card>
  )
}
