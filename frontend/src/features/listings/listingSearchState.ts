import type { ListingSearchState, ListingSort, TransactionType } from '@/types/domain'

export const defaultListingSearchState: ListingSearchState = {
  sort: 'newest',
  page: 0,
  size: 12,
}

const sortValues = new Set<ListingSort>(['newest', 'priceAsc', 'priceDesc', 'areaAsc', 'areaDesc'])
const transactionValues = new Set<TransactionType>(['BUY', 'RENT'])
const numericKeys = [
  'provinceId',
  'districtId',
  'wardId',
  'categoryId',
  'projectId',
  'minPrice',
  'maxPrice',
  'minArea',
  'maxArea',
  'bedrooms',
  'minLat',
  'maxLat',
  'minLng',
  'maxLng',
] as const

function positiveNumber(value: string | null): number | undefined {
  if (value === null || value.trim() === '') return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined
}

function positiveInteger(value: string | null, fallback: number): number {
  const parsed = positiveNumber(value)
  return parsed === undefined ? fallback : Math.floor(parsed)
}

function normalizeRange(
  state: ListingSearchState,
  minKey: 'minPrice' | 'minArea' | 'minLat' | 'minLng',
  maxKey: 'maxPrice' | 'maxArea' | 'maxLat' | 'maxLng',
) {
  const min = state[minKey]
  const max = state[maxKey]
  if (min !== undefined && max !== undefined && min > max) {
    state[minKey] = max
    state[maxKey] = min
  }
}

export function parseListingSearchParams(params: URLSearchParams): ListingSearchState {
  const state: ListingSearchState = {
    ...defaultListingSearchState,
    keyword: params.get('keyword')?.trim() || undefined,
    transactionType: transactionValues.has(params.get('transactionType') as TransactionType)
      ? (params.get('transactionType') as TransactionType)
      : undefined,
    sort: sortValues.has(params.get('sort') as ListingSort)
      ? (params.get('sort') as ListingSort)
      : 'newest',
    page: positiveInteger(params.get('page'), 0),
    size: Math.min(Math.max(positiveInteger(params.get('size'), 12), 1), 100),
  }
  for (const key of numericKeys) state[key] = positiveNumber(params.get(key))
  normalizeRange(state, 'minPrice', 'maxPrice')
  normalizeRange(state, 'minArea', 'maxArea')
  normalizeRange(state, 'minLat', 'maxLat')
  normalizeRange(state, 'minLng', 'maxLng')
  return state
}

export function serializeListingSearchState(state: ListingSearchState): URLSearchParams {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(state)) {
    if (value !== undefined && value !== '' && value !== null) params.set(key, String(value))
  }
  return params
}

export function updateListingFilters(
  state: ListingSearchState,
  updates: Partial<ListingSearchState>,
): ListingSearchState {
  const filterChanged = Object.keys(updates).some(
    (key) =>
      key !== 'page' &&
      state[key as keyof ListingSearchState] !== updates[key as keyof ListingSearchState],
  )
  return { ...state, ...updates, page: filterChanged ? 0 : (updates.page ?? state.page) }
}
