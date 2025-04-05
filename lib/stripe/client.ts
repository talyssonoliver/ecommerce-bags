import Stripe from 'stripe';

// Initialize Stripe with your secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',  // Use the latest API version
  typescript: true,
});

// Helper function to format amount for Stripe (converts dollars to cents)
export function formatAmountForStripe(amount: number, currency: string): number {
  const currencies = ['usd', 'eur', 'gbp'];
  const numberOfZeros = currencies.includes(currency.toLowerCase()) ? 2 : 0;
  return Math.round(amount * Math.pow(10, numberOfZeros));
}

// Helper function to create a payment intent
export async function createPaymentIntent(amount: number, currency: string = 'gbp', metadata: Stripe.Metadata = {}) {
  return await stripe.paymentIntents.create({
    amount: formatAmountForStripe(amount, currency),
    currency,
    metadata,
  });
}

// Helper function to retrieve a checkout session
export async function getCheckoutSession(sessionId: string) {
  return await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items', 'payment_intent'],
  });
}

