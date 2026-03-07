import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAdminOrderDetail } from "@/lib/admin-orders";
import { isAdmin } from "@/lib/auth/session";
import { formatPrice } from "@/lib/formatPrice";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type AdminOrderDetailPageProps = {
  params: Promise<{ id: string }>;
};

function formatOrderDate(value: string | null) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString("en-GB", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
}

export default async function AdminOrderDetailPage({ params }: AdminOrderDetailPageProps) {
  const { id } = await params;
  const order = await getAdminOrderDetail(id);

  if (!order) {
    notFound();
  }

  const orderId = order.id;

  async function cancelOrderAction() {
    "use server";

    const supabase = await createServerSupabaseClient();
    const hasAdminAccess = await isAdmin(supabase);

    if (!hasAdminAccess) {
      redirect("/admin/login");
    }

    const adminSupabase = createAdminSupabaseClient();
    const { error } = await adminSupabase
      .from("orders")
      .update({ status: "Cancelled" })
      .eq("id", orderId)
      .eq("status", "Pending")
      .eq("payment_status", "unpaid");

    if (error) {
      throw new Error("Failed to cancel order.");
    }

    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
  }

  const canCancel = order.status === "Pending" && order.paymentStatus === "unpaid";

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Order detail</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">{order.id}</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            Back to orders
          </Link>
          {canCancel ? (
            <form action={cancelOrderAction}>
              <button
                type="submit"
                className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-500/20"
              >
                Cancel unpaid order
              </button>
            </form>
          ) : null}
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-border bg-card p-6">
            <h2 className="text-xl font-semibold">Items</h2>
            <div className="mt-6 space-y-4">
              {order.items.map((item) => (
                <div key={`${order.id}-${item.productId}`} className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-background/40 p-4">
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-border bg-background">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{item.name}</p>
                      <p className="text-sm text-muted-foreground">Qty {item.quantity}</p>
                      <Link href={`/products/${encodeURIComponent(item.slug)}`} className="text-sm text-primary hover:underline">
                        View product
                      </Link>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-medium">{formatPrice(item.unitPrice)}</p>
                    <p className="text-muted-foreground">Line total {formatPrice(item.lineTotal)}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-card p-6">
            <h2 className="text-xl font-semibold">Customer</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Detail label="Name" value={order.customerName} />
              <Detail label="Email" value={order.customerEmail || "Not provided"} />
              <Detail label="Phone" value={order.customerPhone || "Not provided"} />
              <Detail label="Country" value={order.shippingCountry || "Not provided"} />
              <Detail label="Address" value={order.shippingAddressLine1 || "Not provided"} />
              <Detail
                label="City / Postcode"
                value={`${order.shippingCity || ""} ${order.shippingPostalCode || ""}`.trim() || "Not provided"}
              />
            </div>
            {order.notes ? (
              <div className="mt-6">
                <p className="mb-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">Notes</p>
                <p className="rounded-2xl bg-background/40 p-4 text-sm text-foreground">{order.notes}</p>
              </div>
            ) : null}
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-3xl border border-border bg-card p-6">
            <h2 className="text-xl font-semibold">Payment</h2>
            <div className="mt-6 space-y-4 text-sm">
              <Detail label="Order status" value={order.status} />
              <Detail label="Payment status" value={order.paymentStatus} />
              <Detail label="Created" value={formatOrderDate(order.createdAt)} />
              <Detail label="Paid at" value={formatOrderDate(order.paidAt)} />
              <Detail label="Stripe session" value={order.stripeCheckoutSessionId || "Not created"} />
              <Detail label="Payment intent" value={order.stripePaymentIntentId || "Not available"} />
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-card p-6">
            <h2 className="text-xl font-semibold">Totals</h2>
            <div className="mt-6 space-y-3 text-sm">
              <Row label="Subtotal" value={formatPrice(order.subtotal)} />
              <Row label="Shipping" value={formatPrice(order.shipping)} />
              <Row label="Total" value={formatPrice(order.total)} emphasize />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="text-sm text-foreground">{value}</p>
    </div>
  );
}

function Row({ label, value, emphasize = false }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${emphasize ? "border-t border-border pt-3 text-base font-semibold" : "text-muted-foreground"}`}>
      <span>{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}
