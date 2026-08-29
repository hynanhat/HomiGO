import { apiClient } from '@/lib/api/client'
import type { PageResponse } from '@/types/api'

export type NotificationType =
  'LISTING_SUBMITTED' | 'LISTING_APPROVED' | 'LISTING_REJECTED' | 'LISTING_EXPIRED'

export interface NotificationItem {
  id: number
  type: NotificationType
  title: string
  message: string
  listingId: number | null
  listingPublicCode: string | null
  read: boolean
  readAt: string | null
  createdAt: string
}

export interface UnreadCount {
  count: number
}

export interface ReadAllResult {
  updatedCount: number
}

export const getNotifications = (page = 0, size = 20, unreadOnly = false) =>
  apiClient.get<PageResponse<NotificationItem>>('/notifications', {
    params: { page, size, unreadOnly },
  })

export const getUnreadCount = () => apiClient.get<UnreadCount>('/notifications/unread-count')

export const markNotificationRead = (notificationId: number) =>
  apiClient.patch<NotificationItem>(`/notifications/${notificationId}/read`)

export const markAllNotificationsRead = () =>
  apiClient.patch<ReadAllResult>('/notifications/read-all')

export function notificationTarget(notification: NotificationItem): string | null {
  if (notification.type === 'LISTING_SUBMITTED') return '/admin/listings'
  if (notification.type === 'LISTING_APPROVED' && notification.listingPublicCode) {
    return `/listings/${notification.listingPublicCode}`
  }
  return notification.listingId ? `/seller/listings/${notification.listingId}` : null
}
