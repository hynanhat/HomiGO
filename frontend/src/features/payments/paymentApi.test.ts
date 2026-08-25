import { describe, expect, it } from 'vitest'
import {
  createSellerUpgradeCheckout,
  getSellerUpgradeHistory,
  getSellerUpgradeOffer,
  getSellerUpgradePayment,
} from './paymentApi'

describe('SePay payment API', () => {
  it('loads offer, creates checkout and reads private status/history', async () => {
    const offer = await getSellerUpgradeOffer()
    expect(offer).toMatchObject({ amount: 99_000, currency: 'VND', provider: 'SEPAY', configured: true })

    const checkout = await createSellerUpgradeCheckout()
    expect(checkout.checkoutUrl).toBe('https://pay-sandbox.sepay.vn/v1/checkout/init')
    expect(checkout.fields).toMatchObject({ payment_method: 'BANK_TRANSFER', order_amount: '99000' })
    expect(checkout.fields.signature).toBeTruthy()

    expect((await getSellerUpgradePayment(checkout.payment.orderCode)).status).toBe('PENDING')
    expect((await getSellerUpgradeHistory()).content[0].orderCode).toBe(checkout.payment.orderCode)
  })
})
