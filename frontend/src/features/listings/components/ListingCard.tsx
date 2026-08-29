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
    <Card
      className={`group overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)] ${compact ? 'sm:flex' : ''}`}
    >
      <div className={`relative ${compact ? 'sm:w-64 sm:shrink-0' : ''}`}>
        <Link
          className="relative block h-full overflow-hidden bg-slate-100"
          to={`/listings/${listing.publicCode}`}
          aria-label={`Xem ${listing.title}`}
        >
          <img
            src={listing.images[0] || fallbackImage}
            alt={listing.images[0] ? `Ảnh ${listing.title}` : ''}
            loading="lazy"
            decoding="async"
            width="800"
            height="520"
            className="aspect-[4/3] h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
            onError={(event) => {
              event.currentTarget.onerror = null
              event.currentTarget.src = fallbackImage
            }}
          />
          <span className="absolute left-3 top-3 rounded-full border border-white/60 bg-white/88 px-3 py-1.5 text-xs font-bold text-brand-800 shadow-sm backdrop-blur-md">
            {listing.categoryName}
          </span>
          <span
            className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-ink-950/35 to-transparent"
            aria-hidden="true"
          />
        </Link>
        <div className="absolute right-3 top-3">
          <FavoriteButton listing={listing} compact />
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col p-5">
        <Link
          to={`/listings/${listing.publicCode}`}
          className="line-clamp-2 text-lg font-bold leading-6 text-ink-950 transition hover:text-brand-700"
        >
          {listing.title}
        </Link>
        <p className="mt-3 text-xl font-extrabold text-brand-700">
          {formatCurrency(listing.price)}
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-sm font-semibold text-ink-600">
          <span className="inline-flex items-center gap-1">
            <Maximize2 className="size-4" aria-hidden="true" />
            {formatArea(listing.area)}
          </span>
          {listing.bedrooms !== null && listing.bedrooms !== undefined && (
            <span className="inline-flex items-center gap-1">
              <BedDouble className="size-4" aria-hidden="true" />
              {listing.bedrooms} phòng ngủ
            </span>
          )}
        </div>
        <p className="mt-3 line-clamp-2 inline-flex items-start gap-1.5 text-sm leading-5 text-ink-600">
          <MapPin className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden="true" />
          {address}
        </p>
        <p className="mt-auto border-t border-brand-100 pt-4 text-xs font-bold uppercase tracking-wide text-slate-500">
          Mã tin: {listing.publicCode}
        </p>
      </div>
    </Card>
  )
}
