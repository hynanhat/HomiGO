import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '../../../tests/mocks/server'
import { getRecommendations } from './recommendationApi'

describe('recommendation API', () => {
  it('requests a bounded number of recommendations for the listing', async () => {
    server.use(
      http.get('*/api/v1/listings/HMG-2026-000101/recommendations', ({ request }) => {
        expect(new URL(request.url).searchParams.get('size')).toBe('3')
        return HttpResponse.json({
          success: true,
          message: 'Thành công.',
          errorCode: null,
          data: [
            {
              listing: { id: 102, publicCode: 'HMG-2026-000102' },
              score: 91,
              reasons: ['Cùng dự án'],
            },
          ],
        })
      }),
    )

    const result = await getRecommendations('HMG-2026-000101', 3)

    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({ score: 91, reasons: ['Cùng dự án'] })
  })
})
