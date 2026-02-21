import Link from "next/link";
import { siteConfig } from "@/config/site";

export default function CheckoutPage() {
  return (
    <section className="min-h-[70vh] px-6 py-24 md:py-32">
      <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-card p-8 text-center md:p-12">
        <p className="mb-3 text-xs uppercase tracking-[0.35em] text-primary">Checkout</p>
        <h1 className="mb-4 text-4xl font-light text-foreground">Checkout Placeholder</h1>
        <p className="mx-auto mb-8 max-w-xl text-muted-foreground">
          Payment processing is intentionally disabled for Day 1 MVP. This route
          confirms navigation and sets up the launch-week flow.
        </p>

        <div className="mb-8 rounded-2xl border border-border bg-background/50 p-6 text-left text-sm">
          <p className="mb-2 text-muted-foreground">Launch defaults</p>
          <p>Currency: {siteConfig.currency}</p>
          <p>Free shipping over: £{siteConfig.shippingThreshold.toFixed(2)}</p>
          <p>Flat shipping: £{siteConfig.shippingFlatRate.toFixed(2)}</p>
          <p>Support: {siteConfig.supportEmail}</p>
        </div>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/order-confirmation"
            className="rounded-full bg-primary px-8 py-3 text-sm font-bold uppercase tracking-widest text-primary-foreground transition-opacity hover:opacity-90"
          >
            Continue to Confirmation
          </Link>
          <Link
            href="/shop"
            className="rounded-full border border-border px-8 py-3 text-sm font-bold uppercase tracking-widest transition-colors hover:border-primary hover:text-primary"
          >
            Return to Shop
          </Link>
        </div>
      </div>
    </section>
  );
}
