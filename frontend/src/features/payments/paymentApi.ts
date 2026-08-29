import { apiClient } from '@/lib/api/client'
import type {
  SePayCheckout,
  SellerUpgradeOffer,
  SellerUpgradePayment,
  SellerUpgradePaymentPage,
} from './paymentTypes'

const basePath = '/payments/sepay/seller-upgrade'

export const getSellerUpgradeOffer = () => apiClient.get<SellerUpgradeOffer>(`${basePath}/offer`)
export const createSellerUpgradeCheckout = () => apiClient.post<SePayCheckout>(basePath)
export const getSellerUpgradePayment = (orderCode: string) =>
  apiClient.get<SellerUpgradePayment>(`${basePath}/${encodeURIComponent(orderCode)}`)
export const getSellerUpgradeHistory = (page = 0, size = 10) =>
  apiClient.get<SellerUpgradePaymentPage>(basePath, { params: { page, size } })
