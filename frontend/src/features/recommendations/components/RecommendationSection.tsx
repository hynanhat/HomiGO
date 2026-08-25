import { ArrowRight, MapPin, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Skeleton } from '@/components/feedback'
import { Card } from '@/components/ui'
import { formatAddress, formatArea, formatCurrency } from '@/lib/formatters'
import { useRecommendations } from '../recommendationQueries'

const fallbackImage = '/listing-placeholder.svg'

export function RecommendationSection({ publicCode }: { publicCode: string }) {
  const query = useRecommendations(publicCode)

  return (
    <section aria-labelledby="recommendation-title">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-brand-700">
            <Sparkles className="size-4" aria-hidden="true" />Gợi ý thông minh
          </p>
          <h2 id="recommendation-title" className="mt-2 text-2xl font-extrabold text-ink-950">Bất động sản dành cho bạn</h2>
          <p className="mt-1 text-sm text-ink-600">Được xếp hạng theo loại hình, vị trí, mức giá và diện tích tương đồng.</p>
        </div>
        <Link className="inline-flex items-center gap-1 text-sm font-bold text-brand-700 hover:text-brand-800" to="/listings">
          Xem tất cả <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>

      {query.isLoading && <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 3 }, (_, index) => <Skeleton key={index} className="h-80" />)}</div>}
      {query.isError && <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Gợi ý tạm thời chưa khả dụng. Bạn vẫn có thể tiếp tục xem thông tin tin đăng.</p>}
      {query.data?.length === 0 && <p className="mt-5 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-ink-600">Chưa có bất động sản tương tự đang hoạt động.</p>}

      {query.data && query.data.length > 0 && (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {query.data.map(({ listing, score, reasons }) => (
            <Card key={listing.id} className="recommendation-card overflow-hidden">
              <Link to={`/listings/${listing.publicCode}`} className="group block">
                <img
                  src={listing.images[0] || fallbackImage}
                  alt={listing.images[0] ? `Ảnh ${listing.title}` : ''}
                  loading="lazy"
                  width="640"
                  height="400"
                  className="aspect-[8/5] w-full bg-slate-100 object-cover transition duration-300 group-hover:scale-[1.02]"
                  onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = fallbackImage }}
                />
                <div className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-800">Phù hợp {score}%</span>
                    <span className="text-xs font-semibold text-slate-500">{formatArea(listing.area)}</span>
                  </div>
                  <h3 className="mt-3 line-clamp-2 font-bold text-ink-950 group-hover:text-brand-700">{listing.title}</h3>
                  <p className="mt-2 text-lg font-extrabold text-brand-700">{formatCurrency(listing.price)}</p>
                  <p className="mt-2 flex items-start gap-1 text-sm text-ink-600"><MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />{formatAddress(listing)}</p>
                  <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Lý do gợi ý">
                    {reasons.map((reason) => <li key={reason} className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-ink-700">{reason}</li>)}
                  </ul>
                </div>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}
