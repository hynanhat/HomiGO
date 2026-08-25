import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '../../../tests/mocks/server'
import * as api from './adminApi'

describe('admin API contracts', () => {
  it('supports moderation and user state changes', async () => { expect((await api.getModerationQueue()).content).toHaveLength(1); expect((await api.approveListing(401)).status).toBe('ACTIVE'); expect((await api.rejectListing(401, 'Thiếu giấy tờ')).rejectionReason).toBe('Thiếu giấy tờ'); expect((await api.getAdminUsers()).content).toHaveLength(1); expect((await api.banUser(301, 'Vi phạm')).status).toBe('BANNED'); expect((await api.unbanUser(301)).status).toBe('ACTIVE') })
  it('supports category, full project data and location CRUD', async () => { const category = await api.createCategory({ name: 'Đất', slug: 'dat', transactionType: 'BUY' }); expect(category.slug).toBe('dat'); await api.updateCategory(category.id, { name: 'Đất nền', slug: 'dat-nen', transactionType: 'BUY' }); await api.deleteCategory(category.id); const projects = await api.getAdminProjects(); expect(projects.totalElements).toBe(1); expect(projects.content[0]).toMatchObject({ description: expect.any(String), latitude: expect.any(Number), longitude: expect.any(Number) }); expect((await api.getAdminLocations('provinces')).totalElements).toBe(1) })
  it.each([400, 403, 409])('surfaces safe %s responses', async (status) => { server.use(http.post('*/api/v1/admin/categories', () => HttpResponse.json({ success: false, data: null, message: 'Yêu cầu bị từ chối', errorCode: 'ADMIN_ERROR' }, { status }))); await expect(api.createCategory({ name: 'Đất', slug: 'dat', transactionType: 'BUY' })).rejects.toMatchObject({ status }) })
})
