import { Badge, Card } from '@/components/ui'
import { formatDate } from '@/lib/formatters'
import type { AdminListingHistory } from '@/types/domain'

export function ModerationHistory({ entries }: { entries: AdminListingHistory[] }) {
  return (
    <Card className="p-5">
      <h2 className="text-lg font-bold">Lịch sử trạng thái</h2>
      {entries.length === 0 ? (
        <p className="mt-3 text-sm text-ink-600">Chưa có lịch sử trạng thái.</p>
      ) : (
        <ol className="mt-4 grid gap-4">
          {entries.map((entry) => (
            <li key={entry.id} className="border-l-2 border-brand-200 pl-4">
              <Badge status={entry.toStatus} />
              <p className="mt-2 text-sm font-semibold text-ink-900">
                {entry.changedByName} · {formatDate(entry.createdAt)}
              </p>
              {entry.reason && <p className="mt-1 text-sm text-ink-700">{entry.reason}</p>}
            </li>
          ))}
        </ol>
      )}
    </Card>
  )
}
