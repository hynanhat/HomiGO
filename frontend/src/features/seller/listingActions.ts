import type { ListingStatus } from '@/types/domain'
import type { ListingLifecycleAction } from './sellerTypes'

const actions: Record<ListingStatus, ListingLifecycleAction[]> = {
  DRAFT: ['edit', 'submit', 'delete'],
  PENDING: [],
  ACTIVE: ['edit', 'deactivate'],
  REJECTED: ['edit', 'submit', 'delete'],
  INACTIVE: ['edit', 'submit', 'delete'],
  EXPIRED: ['edit', 'delete'],
}
export const actionsForStatus = (status: ListingStatus) => actions[status]
export const canRunListingAction = (status: ListingStatus, action: ListingLifecycleAction) =>
  actions[status].includes(action)
export const canManageListingImages = (status: ListingStatus) =>
  ['DRAFT', 'REJECTED', 'INACTIVE'].includes(status)
