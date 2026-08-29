import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '../../../tests/mocks/server'
import {
  getNotifications,
  getUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
} from './notificationApi'

describe('notification API', () => {
  it('sends inbox filters and unwraps notification data', async () => {
    server.use(
      http.get('*/api/v1/notifications', ({ request }) => {
        const url = new URL(request.url)
        expect(url.searchParams.get('page')).toBe('2')
        expect(url.searchParams.get('size')).toBe('5')
        expect(url.searchParams.get('unreadOnly')).toBe('true')
        return HttpResponse.json({
          success: true,
          message: 'OK',
          errorCode: null,
          data: {
            content: [],
            number: 2,
            size: 5,
            totalElements: 0,
            totalPages: 0,
            numberOfElements: 0,
            first: false,
            last: true,
            empty: true,
          },
        })
      }),
    )

    const page = await getNotifications(2, 5, true)
    expect(page.number).toBe(2)
  })

  it('loads count and supports read actions', async () => {
    await expect(getUnreadCount()).resolves.toEqual({ count: 1 })
    await expect(markNotificationRead(701)).resolves.toMatchObject({ id: 701, read: true })
    await expect(markAllNotificationsRead()).resolves.toEqual({ updatedCount: 1 })
  })
})
