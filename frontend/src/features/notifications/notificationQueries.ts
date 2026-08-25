import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getNotifications,
  getUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
} from './notificationApi'

const configuredPollInterval = Number(import.meta.env.VITE_NOTIFICATION_POLL_INTERVAL_MS)
export const notificationPollInterval = Number.isFinite(configuredPollInterval) && configuredPollInterval >= 5_000
  ? configuredPollInterval
  : 30_000

export const notificationKeys = {
  all: ['notifications'] as const,
  page: (page: number, size: number, unreadOnly: boolean) => ['notifications', 'page', page, size, unreadOnly] as const,
  unreadCount: ['notifications', 'unread-count'] as const,
}

export function useNotifications(page: number, unreadOnly = false, size = 20) {
  return useQuery({
    queryKey: notificationKeys.page(page, size, unreadOnly),
    queryFn: () => getNotifications(page, size, unreadOnly),
    refetchInterval: notificationPollInterval,
  })
}

export function useUnreadCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount,
    queryFn: getUnreadCount,
    refetchInterval: notificationPollInterval,
  })
}

export function useMarkNotificationRead() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => client.invalidateQueries({ queryKey: notificationKeys.all }),
  })
}

export function useMarkAllNotificationsRead() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => client.invalidateQueries({ queryKey: notificationKeys.all }),
  })
}
