import type { ProjectSearchState, ProjectStatus } from '@/types/domain'

export const defaultProjectSearchState: ProjectSearchState = { page: 0, size: 12 }
const statuses = new Set<ProjectStatus>(['PLANNING', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD'])

export function parseProjectSearchParams(params: URLSearchParams): ProjectSearchState {
  const district = Number(params.get('districtId'))
  const page = Number(params.get('page'))
  const size = Number(params.get('size'))
  const status = params.get('status') as ProjectStatus
  return {
    keyword: params.get('keyword')?.trim() || undefined,
    districtId: Number.isInteger(district) && district > 0 ? district : undefined,
    status: statuses.has(status) ? status : undefined,
    page: Number.isInteger(page) && page >= 0 ? page : 0,
    size: Number.isInteger(size) && size > 0 && size <= 100 ? size : 12,
  }
}

export function serializeProjectSearchState(state: ProjectSearchState): URLSearchParams {
  const params = new URLSearchParams()
  Object.entries(state).forEach(([key, value]) => {
    if (value !== undefined && value !== '') params.set(key, String(value))
  })
  return params
}

export function updateProjectFilters(
  state: ProjectSearchState,
  updates: Partial<ProjectSearchState>,
) {
  const changed = Object.keys(updates).some(
    (key) =>
      key !== 'page' &&
      state[key as keyof ProjectSearchState] !== updates[key as keyof ProjectSearchState],
  )
  return { ...state, ...updates, page: changed ? 0 : (updates.page ?? state.page) }
}
