import Stripe from "stripe";

const secretKey = process.env['STRIPE_SECRET_KEY']
if (!secretKey) throw new Error('STRIPE_SECRET_KEY não definido')

export const stripe: Stripe = new Stripe(secretKey)