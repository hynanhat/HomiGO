import type { PageResponse } from '@/types/api'

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'EXPIRED'

export interface SellerUpgradeOffer {
  amount: number
  currency: string
  provider: 'SEPAY'
  environment: string
  configured: boolean
}

export interface SellerUpgradePayment {
  id: number
  orderCode: string
  purpose: 'SELLER_UPGRADE'
  amount: number
  currency: string
  status: PaymentStatus
  providerOrderId: string | null
  providerTransactionId: string | null
  failureReason: string | null
  expiresAt: string
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface SePayCheckout {
  payment: SellerUpgradePayment
  checkoutUrl: string
  method: 'POST'
  fields: Record<string, string>
}

export type SellerUpgradePaymentPage = PageResponse<SellerUpgradePayment>
