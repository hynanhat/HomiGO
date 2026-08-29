import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { EmptyState, ErrorState, Skeleton } from '@/components/feedback'
import { Pagination } from '@/components/ui'
import { ProjectCard } from '@/features/projects/components/ProjectCard'
import { ProjectFilters } from '@/features/projects/components/ProjectFilters'
import { useProjectSearch } from '@/features/projects/projectQueries'
import {
  parseProjectSearchParams,
  serializeProjectSearchState,
  updateProjectFilters,
} from '@/features/projects/projectSearchState'
import type { ProjectSearchState } from '@/types/domain'

export default function ProjectListPage() {
  const [params, setParams] = useSearchParams()
  const state = useMemo(() => parseProjectSearchParams(params), [params])
  const query = useProjectSearch(state)
  const update = (updates: Partial<ProjectSearchState>) =>
    setParams(serializeProjectSearchState(updateProjectFilters(state, updates)))
  return (
    <main className="min-h-screen py-10 lg:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="eyebrow">Bức tranh đô thị</p>
        <h1 className="mt-2 text-3xl font-bold text-ink-950 sm:text-4xl">Dự án bất động sản</h1>
        <p className="mt-3 max-w-2xl text-ink-600">
          Thông tin quy hoạch, tiến độ và các tin đăng đang hoạt động được trình bày trong một dòng
          chảy rõ ràng.
        </p>
        <div className="mt-8">
          <ProjectFilters value={state} onChange={update} />
        </div>
        <p className="my-6 font-bold text-ink-800" aria-live="polite">
          {query.data ? `${query.data.totalElements} dự án` : 'Đang tải dự án…'}
        </p>
        {query.isPending && (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} className="h-64" />
            ))}
          </div>
        )}
        {query.isError && <ErrorState onRetry={() => query.refetch()} />}
        {query.data?.empty && <EmptyState title="Không tìm thấy dự án" />}
        {query.data && !query.data.empty && (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {query.data.content.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        )}
        {query.data && (
          <div className="mt-8">
            <Pagination
              page={state.page}
              totalPages={query.data.totalPages}
              onPageChange={(page) => update({ page })}
            />
          </div>
        )}
      </div>
    </main>
  )
}
