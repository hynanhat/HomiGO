import { useState } from 'react'
import { CalendarDays, Eye, TrendingUp } from 'lucide-react'
import { ErrorState, Skeleton } from '@/components/feedback'
import { Card, Select } from '@/components/ui'
import { formatDate } from '@/lib/formatters'
import { useSellerListingStatistics } from '../analyticsQueries'

const numberFormatter = new Intl.NumberFormat('vi-VN')

export function ListingStatistics({ listingId }: { listingId: number }) {
  const [days, setDays] = useState(30)
  const query = useSellerListingStatistics(listingId, days)

  if (query.isLoading) return <Skeleton className="h-80" />
  if (query.isError || !query.data) {
    return <ErrorState title="Không thể tải thống kê" description="Số liệu lượt xem hiện chưa khả dụng." onRetry={() => query.refetch()} />
  }

  const statistics = query.data
  const maximum = Math.max(1, ...statistics.dailyViews.map((item) => item.views))
  const metrics = [
    { label: 'Tổng lượt xem', value: statistics.totalViews, icon: Eye },
    { label: 'Hôm nay', value: statistics.todayViews, icon: CalendarDays },
    { label: '7 ngày gần nhất', value: statistics.last7DaysViews, icon: TrendingUp },
  ]

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.12em] text-brand-700">Hiệu quả tin đăng</p>
          <h2 className="mt-2 text-xl font-bold text-ink-950">Thống kê lượt xem duy nhất</h2>
          <p className="mt-1 text-sm text-ink-600">Mỗi khách được tính một lần cho mỗi ngày.</p>
        </div>
        <Select label="Khoảng thống kê" value={days} onChange={(event) => setDays(Number(event.target.value))} className="min-w-36">
          <option value={7}>7 ngày</option>
          <option value={30}>30 ngày</option>
          <option value={90}>90 ngày</option>
        </Select>
      </div>

      <dl className="mt-6 grid gap-3 sm:grid-cols-3">
        {metrics.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <dt className="flex items-center gap-2 text-sm font-medium text-ink-600"><Icon className="size-4 text-brand-700" aria-hidden="true" />{label}</dt>
            <dd className="mt-2 text-2xl font-extrabold text-ink-950">{numberFormatter.format(value)}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-7">
        <h3 className="font-bold text-ink-950">Xu hướng theo ngày</h3>
        <div className="analytics-chart" role="img" aria-label={`Biểu đồ lượt xem trong ${days} ngày`}>
          {statistics.dailyViews.map((item) => (
            <div key={item.date} className="analytics-bar-column" title={`${formatDate(item.date)}: ${item.views} lượt xem`}>
              <span className="analytics-bar-value">{item.views}</span>
              <span className="analytics-bar" style={{ height: `${Math.max(item.views ? 8 : 2, (item.views / maximum) * 100)}%` }} />
              <span className="analytics-bar-label">{formatDate(item.date).slice(0, 5)}</span>
            </div>
          ))}
        </div>
        <details className="mt-4 text-sm text-ink-700">
          <summary className="cursor-pointer font-semibold text-brand-700">Xem số liệu dạng danh sách</summary>
          <ul className="mt-3 grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
            {statistics.dailyViews.map((item) => <li key={item.date}>{formatDate(item.date)}: {item.views} lượt xem</li>)}
          </ul>
        </details>
      </div>
    </Card>
  )
}
