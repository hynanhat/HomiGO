import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '../../../tests/mocks/server'
import * as api from './adminApi'

describe('admin API contracts', () => {
  it('supports detail-first moderation and user state changes', async () => {
    expect((await api.getModerationQueue()).content).toHaveLength(1)
    expect((await api.getAdminListing(401)).listing.id).toBe(401)
    expect((await api.approveListing(401, 0)).status).toBe('ACTIVE')
    expect((await api.rejectListing(401, 'Thiếu giấy tờ', 0)).rejectionReason).toBe('Thiếu giấy tờ')
    expect((await api.removeListing(401, 'Vi phạm nội dung', 0)).status).toBe('REMOVED')
    expect((await api.getAdminUsers()).content).toHaveLength(1)
    expect((await api.banUser(301, 'Vi phạm')).status).toBe('BANNED')
    expect((await api.unbanUser(301)).status).toBe('ACTIVE')
  })

  it('supports category and full project data', async () => {
    const category = await api.createCategory({ name: 'Đất', slug: 'dat', transactionType: 'BUY' })
    expect(category.slug).toBe('dat')
    await api.updateCategory(category.id, {
      name: 'Đất nền',
      slug: 'dat-nen',
      transactionType: 'BUY',
    })
    await api.deleteCategory(category.id)
    const projects = await api.getAdminProjects()
    expect(projects.totalElements).toBe(1)
    expect(projects.content[0]).toMatchObject({
      description: expect.any(String),
      latitude: expect.any(Number),
      longitude: expect.any(Number),
    })
  })

  it('supports the pinned production bootstrap contracts', async () => {
    const datasets = await api.getAdministrativeDatasets()
    expect(datasets.content[0]).toMatchObject({
      datasetVersion: api.PINNED_ADMINISTRATIVE_DATASET_VERSION,
      expectedProvinceCount: 34,
      expectedCommuneCount: 3321,
      status: 'VALIDATED',
    })
    await expect(
      api.validateAdministrativeDataset(api.PINNED_ADMINISTRATIVE_DATASET_VERSION),
    ).resolves.toMatchObject({ status: 'VALIDATED', actualProvinceCount: 34 })
    await expect(
      api.activateAdministrativeDataset(api.PINNED_ADMINISTRATIVE_DATASET_VERSION),
    ).resolves.toMatchObject({ status: 'ACTIVE', actualCommuneCount: 3321 })
    await expect(
      api.initializeProductionCategories(api.PINNED_PRODUCTION_CATEGORY_VERSION),
    ).resolves.toEqual({ version: 'categories-v1', total: 16, created: 13, unchanged: 3 })
  })

  it.each([400, 403, 409])('surfaces safe %s responses', async (status) => {
    server.use(
      http.post('*/api/v1/admin/categories', () =>
        HttpResponse.json(
          { success: false, data: null, message: 'Yêu cầu bị từ chối', errorCode: 'ADMIN_ERROR' },
          { status },
        ),
      ),
    )
    await expect(
      api.createCategory({ name: 'Đất', slug: 'dat', transactionType: 'BUY' }),
    ).rejects.toMatchObject({ status })
  })
})
