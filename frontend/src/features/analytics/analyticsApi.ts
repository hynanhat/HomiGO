import { apiClient } from '@/lib/api/client'

export interface DailyView {
  date: string
  views: number
}

export interface ListingStatistics {
  listingId: number
  publicCode: string
  totalViews: number
  todayViews: number
  last7DaysViews: number
  periodDays: number
  dailyViews: DailyView[]
}

export interface ViewRecordedResult {
  recorded: boolean
}

export const recordListingView = (publicCode: string) =>
  apiClient.post<ViewRecordedResult>(`/listings/${encodeURIComponent(publicCode)}/views`)

export const getSellerListingStatistics = (listingId: number, days = 30) =>
  apiClient.get<ListingStatistics>(`/seller/listings/${listingId}/statistics`, { params: { days } })

export const getAdminListingStatistics = (listingId: number, days = 30) =>
  apiClient.get<ListingStatistics>(`/admin/listings/${listingId}/statistics`, { params: { days } })
