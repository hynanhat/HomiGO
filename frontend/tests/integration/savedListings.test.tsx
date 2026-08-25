import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AuthProvider } from '@/context/AuthContext'
import { FavoriteButton } from '@/features/saved-listings/components/FavoriteButton'
import { listingFixtures } from '../fixtures/apiFixtures'

describe('saved listings', () => {
  it('preserves intended destination when anonymous user saves', async () => { const client = new QueryClient(); render(<QueryClientProvider client={client}><AuthProvider><MemoryRouter initialEntries={['/listings/HMG-2026-000101']}><Routes><Route path="/listings/:code" element={<FavoriteButton listing={listingFixtures[0]} />} /><Route path="/auth/login" element={<h1>Đăng nhập để lưu</h1>} /></Routes></MemoryRouter></AuthProvider></QueryClientProvider>); screen.getByRole('button', { name: 'Lưu tin đăng' }).click(); expect(await screen.findByRole('heading', { name: 'Đăng nhập để lưu' })).toBeInTheDocument() })
})
