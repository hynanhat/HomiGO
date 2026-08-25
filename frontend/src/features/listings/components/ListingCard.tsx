import { BedDouble, MapPin, Maximize2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatAddress, formatArea, formatCurrency } from '@/lib/formatters'
import type { Listing } from '@/types/domain'
import { Card } from '@/components/ui'
import { FavoriteButton } from '@/features/saved-listings/components/FavoriteButton'

const fallbackImage = '/listing-placeholder.svg'

export function ListingCard({ listing, compact = false }: { listing: Listing; compact?: boolean }) {
  const address = formatAddress(listing)
  return (
    <Card className={`group overflow-hidden ${compact ? 'sm:flex' : ''}`}>
      <Link className={`relative block overflow-hidden bg-slate-100 ${compact ? 'sm:w-64 sm:shrink-0' : ''}`} to={`/listings/${listing.publicCode}`} aria-label={`Xem ${listing.title}`}>
        <img
          src={listing.images[0] || fallbackImage}
          alt={listing.images[0] ? `Ảnh ${listing.title}` : ''}
          loading="lazy"
          decoding="async"
          width="800"
          height="520"
          className="aspect-[4/3] h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          onError={(event) => {
            event.currentTarget.onerror = null
            event.currentTarget.src = fallbackImage
          }}
        />
        <span className="absolute left-3 top-3 rounded-md bg-white/95 px-2 py-1 text-xs font-bold text-brand-700">{listing.categoryName}</span>
      </Link>
      <div className="flex min-w-0 flex-1 flex-col p-4">
        <div className="mb-3 flex justify-end"><FavoriteButton listing={listing} compact /></div>
        <Link to={`/listings/${listing.publicCode}`} className="line-clamp-2 text-base font-bold text-ink-950 hover:text-brand-700">
          {listing.title}
        </Link>
        <p className="mt-3 text-lg font-extrabold text-brand-700">{formatCurrency(listing.price)}</p>
        <div className="mt-2 flex flex-wrap gap-3 text-sm text-ink-600">
          <span className="inline-flex items-center gap-1"><Maximize2 className="size-4" aria-hidden="true" />{formatArea(listing.area)}</span>
          {listing.bedrooms !== null && listing.bedrooms !== undefined && <span className="inline-flex items-center gap-1"><BedDouble className="size-4" aria-hidden="true" />{listing.bedrooms} phòng ngủ</span>}
        </div>
        <p className="mt-3 line-clamp-2 inline-flex items-start gap-1 text-sm text-ink-600"><MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />{address}</p>
        <p className="mt-auto pt-4 text-xs font-semibold text-slate-500">Mã tin: {listing.publicCode}</p>
      </div>
    </Card>
  )
}
