import { useEffect, useRef } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { Badge } from '@/components/ui'
import { ErrorState, Skeleton } from '@/components/feedback'
import { AdminListingActions } from '@/features/admin/components/AdminListingActions'
import { AdminListingContent } from '@/features/admin/components/AdminListingContent'
import { ModerationHistory } from '@/features/admin/components/ModerationHistory'
import { useAdminListing } from '@/features/admin/adminQueries'

export default function AdminListingDetailPage() {
  const id = Number(useParams().id)
  const query = useAdminListing(id)
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (query.data) headingRef.current?.focus()
  }, [query.data])

  if (query.isPending) return <Skeleton className="h-96" />
  if (query.isError || !query.data) {
    return <ErrorState title="Không thể tải chi tiết tin đăng" onRetry={() => query.refetch()} />
  }

  const { listing, history } = query.data
  return (
    <div>
      <Link
        to="/admin/listings"
        className="inline-flex min-h-11 items-center gap-2 rounded-xl font-semibold text-brand-700 hover:text-brand-900"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Trở lại hàng đợi
      </Link>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Badge status={listing.status} />
          <h1 ref={headingRef} tabIndex={-1} className="mt-3 text-3xl font-extrabold outline-none">
            {listing.title}
          </h1>
          <p className="mt-2 text-sm text-ink-600">
            {listing.publicCode} · ID {listing.id} · Phiên bản {listing.version}
          </p>
        </div>
      </div>

      <div className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <AdminListingContent detail={query.data} />
        <aside className="grid content-start gap-5 xl:sticky xl:top-6">
          <AdminListingActions listing={listing} onChanged={() => query.refetch()} />
          <ModerationHistory entries={history} />
        </aside>
      </div>
    </div>
  )
}
