import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createSellerUpgradeCheckout,
  getSellerUpgradeHistory,
  getSellerUpgradeOffer,
  getSellerUpgradePayment,
} from './paymentApi'

export const paymentKeys = {
  all: ['payments', 'sepay', 'seller-upgrade'] as const,
  offer: ['payments', 'sepay', 'seller-upgrade', 'offer'] as const,
  detail: (orderCode: string) => ['payments', 'sepay', 'seller-upgrade', 'detail', orderCode] as const,
  history: (page: number, size: number) => ['payments', 'sepay', 'seller-upgrade', 'history', page, size] as const,
}

export function useSellerUpgradeOffer() {
  return useQuery({ queryKey: paymentKeys.offer, queryFn: getSellerUpgradeOffer })
}

export function useCreateSellerUpgradeCheckout() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: createSellerUpgradeCheckout,
    onSuccess: (checkout) => {
      client.setQueryData(paymentKeys.detail(checkout.payment.orderCode), checkout.payment)
      void client.invalidateQueries({ queryKey: paymentKeys.all })
    },
  })
}

export function useSellerUpgradePayment(orderCode: string | null) {
  return useQuery({
    queryKey: paymentKeys.detail(orderCode ?? ''),
    queryFn: () => getSellerUpgradePayment(orderCode!),
    enabled: Boolean(orderCode),
    refetchInterval: (query) => query.state.data?.status === 'PENDING' ? 2_000 : false,
  })
}

export function useSellerUpgradeHistory(page: number, size = 10) {
  return useQuery({
    queryKey: paymentKeys.history(page, size),
    queryFn: () => getSellerUpgradeHistory(page, size),
  })
}
