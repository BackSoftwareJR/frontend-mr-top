import { loadStripe } from '@stripe/stripe-js'

/** @returns {boolean} */
export function isStripeEnabled() {
  const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  return typeof key === 'string' && key.trim() !== ''
}

let stripePromise = null

/** @returns {import('@stripe/stripe-js').Stripe | null} */
export function getStripePromise() {
  if (!isStripeEnabled()) {
    return null
  }

  if (!stripePromise) {
    stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  }

  return stripePromise
}
