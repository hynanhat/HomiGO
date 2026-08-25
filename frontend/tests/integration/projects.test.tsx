import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import ProjectDetailPage from '@/pages/ProjectDetailPage'
import ProjectListPage from '@/pages/ProjectListPage'
import { AuthProvider } from '@/context/AuthContext'

function renderRoutes(entry: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={client}><AuthProvider><MemoryRouter initialEntries={[entry]}><Routes><Route path="/projects" element={<ProjectListPage />} /><Route path="/projects/:slug" element={<ProjectDetailPage />} /></Routes></MemoryRouter></AuthProvider></QueryClientProvider>)
}

describe('project discovery', () => {
  it('renders URL-backed filters, status and project link', async () => {
    renderRoutes('/projects?status=IN_PROGRESS')
    expect(await screen.findByText('1 dự án')).toBeInTheDocument()
    expect(screen.getAllByText('Đang triển khai')).toHaveLength(2)
    expect(screen.getByRole('link', { name: 'Homi Riverside' })).toHaveAttribute('href', '/projects/homi-riverside')
  })

  it('composes slug detail with nested ACTIVE listings', async () => {
    renderRoutes('/projects/homi-riverside')
    expect(await screen.findByRole('heading', { name: 'Homi Riverside' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Tin đăng đang hoạt động' })).toBeInTheDocument()
    expect(screen.getByText('Mã tin: HMG-2026-000101')).toBeInTheDocument()
  })
})
