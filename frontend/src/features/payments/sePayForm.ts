import type { SePayCheckout } from './paymentTypes'

export function submitSePayCheckout(checkout: SePayCheckout): void {
  const action = new URL(checkout.checkoutUrl, window.location.origin)
  if (action.protocol !== 'https:') {
    throw new Error('SePay checkout phải sử dụng kết nối HTTPS.')
  }

  const form = document.createElement('form')
  form.method = checkout.method
  form.action = action.toString()
  form.acceptCharset = 'UTF-8'
  form.hidden = true

  Object.entries(checkout.fields).forEach(([name, value]) => {
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = name
    input.value = value
    form.appendChild(input)
  })

  document.body.appendChild(form)
  try {
    form.submit()
  } catch (error) {
    form.remove()
    throw error
  }
}
