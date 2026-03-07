import Link from "next/link";
import { Package, PoundSterling, ShoppingBag, Users } from "lucide-react";
import { getAdminDashboardSnapshot } from "@/lib/admin-orders";

export const dynamic = "force-dynamic";

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

export default async function AdminDashboardPage() {
  const snapshot = await getAdminDashboardSnapshot();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Launch-day order and catalog overview.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Paid Revenue" value={snapshot.totalRevenue} icon={PoundSterling} />
        <StatCard title="Total Orders" value={String(snapshot.totalOrders)} icon={ShoppingBag} />
        <StatCard title="Customers" value={String(snapshot.customerCount)} icon={Users} />
        <StatCard title="Low Stock" value={String(snapshot.lowStockCount)} icon={Package} />
      </div>

      <div className="overflow-hidden rounded-3xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold">Recent Orders</h2>
            <p className="text-sm text-muted-foreground">Latest customer orders and payment status.</p>
          </div>
          <Link href="/admin/orders" className="text-sm font-semibold text-primary hover:underline">
            View all orders
          </Link>
        </div>

        {snapshot.recentOrders.length === 0 ? (
          <div className="px-6 py-10 text-sm text-muted-foreground">
            No orders yet. Completed Stripe payments will appear here once checkout is live.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-medium">Order</th>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Payment</th>
                  <th className="px-6 py-4 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {snapshot.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 font-medium text-primary">
                      <Link href={`/admin/orders/${encodeURIComponent(order.id)}`} className="hover:underline">
                        {order.id}
                      </Link>
                    </td>
                    <td className="px-6 py-4">{order.customerName}</td>
                    <td className="px-6 py-4 text-muted-foreground">{formatOrderDate(order.createdAt)}</td>
                    <td className="px-6 py-4">
                      <PaymentStatusBadge status={order.paymentStatus} />
                    </td>
                    <td className="px-6 py-4 text-right font-medium">£{order.total.toFixed(2)}</td>
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

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: typeof PoundSterling;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-muted text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="mt-1 text-3xl font-bold tracking-tight">{value}</p>
    </div>
  );
}

function PaymentStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    paid: "border-green-500/20 bg-green-500/10 text-green-600",
    unpaid: "border-yellow-500/20 bg-yellow-500/10 text-yellow-700",
    failed: "border-red-500/20 bg-red-500/10 text-red-600",
    expired: "border-zinc-500/20 bg-zinc-500/10 text-zinc-600",
    refunded: "border-sky-500/20 bg-sky-500/10 text-sky-600",
  };

  return (
    <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${styles[status] || styles.unpaid}`}>
      {status}
    </span>
  );
}
