import { afterEach, describe, expect, it, vi } from 'vitest'
import { submitSePayCheckout } from './sePayForm'
import type { SePayCheckout } from './paymentTypes'

const checkout: SePayCheckout = {
  payment: {
    id: 1,
    orderCode: 'HMG-SEPAY-TEST',
    purpose: 'SELLER_UPGRADE',
    amount: 99_000,
    currency: 'VND',
    status: 'PENDING',
    providerOrderId: null,
    providerTransactionId: null,
    failureReason: null,
    expiresAt: '2026-08-17T12:15:00',
    completedAt: null,
    createdAt: '2026-08-17T12:00:00',
    updatedAt: '2026-08-17T12:00:00',
  },
  checkoutUrl: 'https://pay-sandbox.sepay.vn/v1/checkout/init',
  method: 'POST',
  fields: { merchant: 'SP-TEST', order_invoice_number: 'HMG-SEPAY-TEST', signature: 'signed' },
}

afterEach(() => document.querySelectorAll('form[hidden]').forEach((form) => form.remove()))

describe('submitSePayCheckout', () => {
  it('creates a native HTTPS POST form with backend-signed hidden fields', () => {
    const submit = vi.spyOn(HTMLFormElement.prototype, 'submit').mockImplementation(() => undefined)
    submitSePayCheckout(checkout)

    const form = document.querySelector('form') as HTMLFormElement
    expect(submit).toHaveBeenCalledOnce()
    expect(form.method).toBe('post')
    expect(form.action).toBe(checkout.checkoutUrl)
    expect((form.elements.namedItem('order_invoice_number') as HTMLInputElement).value).toBe('HMG-SEPAY-TEST')
    expect((form.elements.namedItem('signature') as HTMLInputElement).value).toBe('signed')
  })

  it('refuses a non-HTTPS checkout endpoint', () => {
    expect(() => submitSePayCheckout({ ...checkout, checkoutUrl: 'http://untrusted.example/checkout' }))
      .toThrow('HTTPS')
  })
})
