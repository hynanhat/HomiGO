import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '../../../tests/mocks/server'
import { getSellerListingStatistics, recordListingView } from './analyticsApi'

describe('listing analytics API', () => {
  it('records a persistent anonymous visitor ID', async () => {
    server.use(
      http.post('*/api/v1/listings/:publicCode/views', async ({ request }) => {
        expect(await request.text()).toBe('')
        return HttpResponse.json({
          success: true,
          message: 'OK',
          errorCode: null,
          data: { recorded: true },
        })
      }),
    )
    await expect(recordListingView('HMG-2026-000101')).resolves.toEqual({ recorded: true })
  })

  it('requests an authorized statistics period', async () => {
    server.use(
      http.get('*/api/v1/seller/listings/11/statistics', ({ request }) => {
        expect(new URL(request.url).searchParams.get('days')).toBe('7')
        return HttpResponse.json({
          success: true,
          message: 'OK',
          errorCode: null,
          data: {
            listingId: 11,
            publicCode: 'HMG-11',
            totalViews: 2,
            todayViews: 1,
            last7DaysViews: 2,
            periodDays: 7,
            dailyViews: [],
          },
        })
      }),
    )
    await expect(getSellerListingStatistics(11, 7)).resolves.toMatchObject({ periodDays: 7 })
  })
})
