import Link from "next/link";
import { ClearCartOnMount } from "@/components/cart/ClearCartOnMount";
import { formatPrice } from "@/lib/formatPrice";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;
  const orderId = order?.trim() || "";
  const supabase = await createServerSupabaseClient();
  const { data: orderRecord } = orderId
    ? await supabase
        .from("orders")
        .select("id, total, status, payment_status, created_at")
        .eq("id", orderId)
        .maybeSingle()
    : { data: null };

  const paymentStatus = orderRecord?.payment_status ?? "unpaid";
  const title =
    paymentStatus === "paid"
      ? "Payment Successful"
      : paymentStatus === "expired" || paymentStatus === "failed"
        ? "Payment Incomplete"
        : "Order Received";
  const description =
    paymentStatus === "paid"
      ? "Your payment has been confirmed and your order is now being prepared. You can review the order in your account at any time."
      : paymentStatus === "expired" || paymentStatus === "failed"
        ? "We could not complete payment for this order. You can return to checkout and try again."
        : "We have your order and are finalising payment confirmation. This page will update once the payment webhook is processed.";

  return (
    <section className="min-h-[70vh] px-6 py-24 md:py-32">
      {orderRecord ? <ClearCartOnMount /> : null}
      <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-card p-8 text-center md:p-12">
        <p className="mb-3 text-xs uppercase tracking-[0.35em] text-primary">
          Order Confirmation
        </p>
        <h1 className="mb-4 text-4xl font-light text-foreground">{title}</h1>
        <p className="mx-auto mb-6 max-w-xl text-muted-foreground">{description}</p>

        <div className="mx-auto mb-4 inline-flex rounded-full border border-border bg-background/50 px-5 py-2 font-mono text-sm">
          {orderRecord?.id ?? orderId ?? "Order pending"}
        </div>

        {orderRecord ? (
          <p className="mb-8 text-sm text-muted-foreground">
            Total: <span className="font-medium text-foreground">{formatPrice(Number(orderRecord.total))}</span>
          </p>
        ) : null}

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/shop"
            className="rounded-full bg-primary px-8 py-3 text-sm font-bold uppercase tracking-widest text-primary-foreground transition-opacity hover:opacity-90"
          >
            Continue Shopping
          </Link>
          <Link
            href={paymentStatus === "expired" || paymentStatus === "failed" ? "/checkout" : "/account"}
            className="rounded-full border border-border px-8 py-3 text-sm font-bold uppercase tracking-widest transition-colors hover:border-primary hover:text-primary"
          >
            {paymentStatus === "expired" || paymentStatus === "failed"
              ? "Return to Checkout"
              : "View Account"}
          </Link>
        </div>
      </div>
    </section>
  );
}
