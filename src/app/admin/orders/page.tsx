import Link from "next/link";
import { Eye, Search } from "lucide-react";
import { getAdminOrders } from "@/lib/admin-orders";
import type { OrderPaymentStatus, OrderStatus } from "@/types/supabase";

export const dynamic = "force-dynamic";

type AdminOrdersPageProps = {
  searchParams: Promise<{
    q?: string;
    status?: OrderStatus | "all";
    payment?: OrderPaymentStatus | "all";
  }>;
};

function formatOrderDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-GB", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
}

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const status = params.status ?? "all";
  const paymentStatus = params.payment ?? "all";
  const orders = await getAdminOrders({ query, status, paymentStatus });

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">Review real customer orders, payment state, and item counts.</p>
        </div>
      </div>

      <form className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search by order ID or customer email"
            className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary"
          />
        </div>

        <select
          name="status"
          defaultValue={status}
          className="rounded-lg border border-border bg-background px-4 py-2 text-sm outline-none transition-colors focus:border-primary"
        >
          <option value="all">All statuses</option>
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        <select
          name="payment"
          defaultValue={paymentStatus}
          className="rounded-lg border border-border bg-background px-4 py-2 text-sm outline-none transition-colors focus:border-primary"
        >
          <option value="all">All payments</option>
          <option value="unpaid">Unpaid</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
          <option value="expired">Expired</option>
          <option value="refunded">Refunded</option>
        </select>

        <button
          type="submit"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Apply filters
        </button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {orders.length === 0 ? (
          <div className="px-6 py-10 text-sm text-muted-foreground">
            No orders match the current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/30 uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Items</th>
                  <th className="px-6 py-4">Order Status</th>
                  <th className="px-6 py-4">Payment</th>
                  <th className="px-6 py-4 text-right">Total</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((order) => (
                  <tr key={order.id} className="transition-colors hover:bg-muted/20">
                    <td className="px-6 py-4 font-medium text-primary">{order.id}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">{order.customerName}</p>
                        <p className="text-xs text-muted-foreground">{order.customerEmail || "No email saved"}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{formatOrderDate(order.createdAt)}</td>
                    <td className="px-6 py-4 text-muted-foreground">{order.itemCount}</td>
                    <td className="px-6 py-4">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4">
                      <PaymentStatusBadge status={order.paymentStatus} />
                    </td>
                    <td className="px-6 py-4 text-right font-semibold">£{order.total.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/admin/orders/${encodeURIComponent(order.id)}`}
                          className="rounded-lg p-2 transition-colors hover:bg-muted"
                          aria-label={`View order ${order.id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const styles: Record<OrderStatus, string> = {
    Pending: "border-yellow-500/20 bg-yellow-500/10 text-yellow-700",
    Confirmed: "border-green-500/20 bg-green-500/10 text-green-600",
    Cancelled: "border-red-500/20 bg-red-500/10 text-red-600",
  };

  return (
    <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[status]}`}>
      {status}
    </span>
  );
}

function PaymentStatusBadge({ status }: { status: OrderPaymentStatus }) {
  const styles: Record<OrderPaymentStatus, string> = {
    unpaid: "border-yellow-500/20 bg-yellow-500/10 text-yellow-700",
    paid: "border-green-500/20 bg-green-500/10 text-green-600",
    failed: "border-red-500/20 bg-red-500/10 text-red-600",
    expired: "border-zinc-500/20 bg-zinc-500/10 text-zinc-600",
    refunded: "border-sky-500/20 bg-sky-500/10 text-sky-600",
  };

  return (
    <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${styles[status]}`}>
      {status}
    </span>
  );
}
