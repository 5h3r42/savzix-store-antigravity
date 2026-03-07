import Stripe from "stripe";

let stripeClient: Stripe | null = null;

function required(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getStripeClient() {
  if (stripeClient) {
    return stripeClient;
  }

  stripeClient = new Stripe(required("STRIPE_SECRET_KEY"), {
    apiVersion: "2026-02-25.clover",
  });

  return stripeClient;
}

export function getSiteUrl() {
  return required("NEXT_PUBLIC_SITE_URL").replace(/\/$/, "");
}
