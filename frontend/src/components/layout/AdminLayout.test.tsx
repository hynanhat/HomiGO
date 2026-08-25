import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import AdminLayout from './AdminLayout'

describe('AdminLayout', () => {
  it('provides a clear way back to the public homepage', () => {
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<p>Tổng quan</p>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Quay lại trang chủ' })).toHaveAttribute('href', '/')
  })
})
