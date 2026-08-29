import { Bath, BedDouble, MapPin, Maximize2, Phone } from 'lucide-react'
import { formatAddress, formatArea, formatCurrency } from '@/lib/formatters'
import type { Listing } from '@/types/domain'
import { Card } from '@/components/ui'
import { FavoriteButton } from '@/features/saved-listings/components/FavoriteButton'

interface FactProps {
  icon: typeof Maximize2
  value: string | number
  label: string
}

function ListingFact({ icon: Icon, value, label }: FactProps) {
  return (
    <p className="flex items-center gap-3">
      <span className="grid size-11 place-items-center rounded-xl bg-brand-50 text-brand-700">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <span>
        <strong className="block text-lg">{value}</strong>
        <small className="text-ink-600">{label}</small>
      </span>
    </p>
  )
}

export function ListingDetails({ listing }: { listing: Listing }) {
  return (
    <div className="grid gap-7 lg:grid-cols-[1fr_22rem]">
      <div className="space-y-6">
        <section className="rounded-3xl border border-brand-100 bg-white/85 p-6 shadow-[var(--shadow-card)] backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-2xl font-extrabold text-brand-700 sm:text-3xl">
              {formatCurrency(listing.price)}
            </p>
            <FavoriteButton listing={listing} />
          </div>
          <h1 className="mt-3 text-2xl font-bold leading-tight text-ink-950 sm:text-4xl">
            {listing.title}
          </h1>
          <p className="mt-4 flex items-start gap-2 text-ink-600">
            <MapPin className="mt-0.5 size-5 shrink-0 text-brand-600" aria-hidden="true" />
            {formatAddress(listing)}
          </p>
        </section>

        <Card className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-3">
          <ListingFact icon={Maximize2} value={formatArea(listing.area)} label="Diện tích" />
          {listing.bedrooms != null && (
            <ListingFact icon={BedDouble} value={listing.bedrooms} label="Phòng ngủ" />
          )}
          {listing.bathrooms != null && (
            <ListingFact icon={Bath} value={listing.bathrooms} label="Phòng tắm" />
          )}
        </Card>

        <section className="rounded-3xl border border-brand-100 bg-white/85 p-6 shadow-[var(--shadow-card)]">
          <h2 className="text-xl font-bold">Mô tả chi tiết</h2>
          <p className="mt-4 whitespace-pre-line leading-7 text-ink-800">{listing.description}</p>
        </section>

        <section className="rounded-3xl border border-brand-100 bg-white/85 p-6 shadow-[var(--shadow-card)]">
          <h2 className="text-xl font-bold">Vị trí và dự án</h2>
          <p className="mt-3 text-ink-600">{formatAddress(listing)}</p>
          {listing.projectName && (
            <p className="mt-2 font-semibold">Dự án: {listing.projectName}</p>
          )}
        </section>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <Card className="overflow-hidden p-0">
          <div className="bg-gradient-to-br from-brand-50 to-white p-6">
            <p className="eyebrow">Liên hệ người đăng</p>
            <p className="mt-2 text-xl font-bold">{listing.contactName}</p>
            <p className="mt-2 text-sm leading-6 text-ink-600">
              Trao đổi trực tiếp để xác nhận tình trạng và lịch xem bất động sản.
            </p>
            <a
              className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent-600 px-4 text-sm font-bold text-white shadow-[0_10px_24px_rgb(3_105_161/0.18)] transition hover:-translate-y-0.5 hover:bg-accent-700"
              href={`tel:${listing.contactPhone}`}
            >
              <Phone className="size-4" aria-hidden="true" />
              {listing.contactPhone}
            </a>
          </div>
          <p className="border-t border-brand-100 px-5 py-4 text-center text-xs font-semibold text-slate-500">
            Luôn xác minh thông tin trước khi giao dịch.
          </p>
        </Card>
      </aside>
    </div>
  )
}
