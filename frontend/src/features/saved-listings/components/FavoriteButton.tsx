import { useState } from 'react'
import { Heart } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui'
import { useAuth } from '@/context/AuthContext'
import type { Listing } from '@/types/domain'
import { useSavedListingMutation } from '../savedListingQueries'

export function FavoriteButton({ listing, initiallySaved = false, compact = false }: { listing: Listing; initiallySaved?: boolean; compact?: boolean }) {
  const [saved, setSaved] = useState(initiallySaved)
  const { status } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const mutation = useSavedListingMutation(listing, saved, setSaved)
  const toggle = () => {
    if (status !== 'authenticated') { navigate('/auth/login', { state: { from: `${location.pathname}${location.search}` } }); return }
    mutation.mutate()
  }
  return <Button variant={saved ? 'primary' : 'secondary'} size="sm" loading={mutation.isPending} aria-pressed={saved} aria-label={saved ? 'Bỏ lưu tin đăng' : 'Lưu tin đăng'} onClick={toggle}><Heart className={`size-4 ${saved ? 'fill-current' : ''}`} />{!compact && (saved ? 'Đã lưu' : 'Lưu tin')}</Button>
}
