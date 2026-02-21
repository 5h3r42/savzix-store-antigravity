import Link from "next/link";

const mockOrderId = "ORD-MVP-1001";

export default function OrderConfirmationPage() {
  return (
    <section className="min-h-[70vh] px-6 py-24 md:py-32">
      <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-card p-8 text-center md:p-12">
        <p className="mb-3 text-xs uppercase tracking-[0.35em] text-primary">
          Order Confirmation
        </p>
        <h1 className="mb-4 text-4xl font-light text-foreground">Thank You</h1>
        <p className="mx-auto mb-6 max-w-xl text-muted-foreground">
          This is a launch-week placeholder confirmation page. Your order flow is
          wired end-to-end for MVP validation.
        </p>

        <div className="mx-auto mb-8 inline-flex rounded-full border border-border bg-background/50 px-5 py-2 font-mono text-sm">
          {mockOrderId}
        </div>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/shop"
            className="rounded-full bg-primary px-8 py-3 text-sm font-bold uppercase tracking-widest text-primary-foreground transition-opacity hover:opacity-90"
          >
            Continue Shopping
          </Link>
          <Link
            href="/account"
            className="rounded-full border border-border px-8 py-3 text-sm font-bold uppercase tracking-widest transition-colors hover:border-primary hover:text-primary"
          >
            View Account
          </Link>
        </div>
      </div>
    </section>
  );
}
