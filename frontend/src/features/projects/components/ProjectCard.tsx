import { Building2, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge, Card } from '@/components/ui'
import { formatCurrency, formatProjectStatus } from '@/lib/formatters'
import type { ProjectSummary } from '@/types/domain'

export function ProjectCard({ project }: { project: ProjectSummary }) {
  const price = project.priceFrom ? `Từ ${formatCurrency(project.priceFrom)}` : 'Liên hệ chủ đầu tư'

  return (
    <Card className="group flex h-full flex-col p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]">
      <div className="flex items-start justify-between gap-3">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100 text-brand-700 transition duration-300 group-hover:scale-105">
          <Building2 className="size-6" aria-hidden="true" />
        </span>
        <Badge
          variant={
            project.status === 'COMPLETED'
              ? 'success'
              : project.status === 'ON_HOLD'
                ? 'warning'
                : 'info'
          }
        >
          {formatProjectStatus(project.status)}
        </Badge>
      </div>
      <Link
        to={`/projects/${project.slug}`}
        className="mt-6 text-xl font-bold leading-7 text-ink-950 transition hover:text-brand-700"
      >
        {project.name}
      </Link>
      <p className="mt-1 text-sm text-ink-600">Chủ đầu tư: {project.investor}</p>
      <p className="mt-4 flex items-start gap-2 text-sm text-ink-600">
        <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        {[project.address, project.wardName, project.districtName].filter(Boolean).join(', ')}
      </p>
      <p className="mt-auto border-t border-brand-100 pt-5 text-lg font-extrabold text-brand-700">
        {price}
      </p>
      {project.priceTo && (
        <p className="mt-1 text-xs text-slate-500">Tối đa {formatCurrency(project.priceTo)}</p>
      )}
    </Card>
  )
}
