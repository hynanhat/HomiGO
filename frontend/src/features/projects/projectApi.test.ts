import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '../../../tests/mocks/server'
import { getProject, searchProjects } from './projectApi'

describe('project API', () => {
  it('passes filters and unwraps project pages', async () => {
    server.use(
      http.get('*/api/v1/projects', ({ request }) => {
        expect(new URL(request.url).searchParams.get('status')).toBe('IN_PROGRESS')
        return HttpResponse.json({
          success: true,
          message: 'OK',
          errorCode: null,
          data: {
            content: [],
            number: 0,
            size: 12,
            totalElements: 0,
            totalPages: 0,
            numberOfElements: 0,
            first: true,
            last: true,
            empty: true,
          },
        })
      }),
    )
    expect((await searchProjects({ status: 'IN_PROGRESS', page: 0, size: 12 })).empty).toBe(true)
  })

  it('loads slug detail with nested ACTIVE listings and pagination', async () => {
    const project = await getProject('homi-riverside', 0, 12)
    expect(project.slug).toBe('homi-riverside')
    expect(project.listings.content.every((item) => item.status === 'ACTIVE')).toBe(true)
  })

  it('surfaces a project 404', async () => {
    await expect(getProject('missing')).rejects.toMatchObject({ status: 404 })
  })
})
