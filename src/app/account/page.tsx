import { CheckCircle, Clock, Package, Truck } from "lucide-react";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";

const currencyFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

type OrderRow = Database["public"]["Tables"]["orders"]["Row"];

function formatOrderDate(isoDate: string) {
  const parsed = new Date(isoDate);

  if (Number.isNaN(parsed.getTime())) {
    return isoDate;
  }

  return parsed.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function StatusBadge({ status }: { status: OrderRow["status"] }) {
  if (status === "Confirmed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-green-500/20 bg-green-500/10 px-2 py-1 text-xs font-medium text-green-500">
        <CheckCircle className="h-3 w-3" /> Confirmed
      </span>
    );
  }

  if (status === "Pending") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-500">
        <Truck className="h-3 w-3" /> Pending
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-red-500/20 bg-red-500/10 px-2 py-1 text-xs font-medium text-red-500">
      <Clock className="h-3 w-3" /> Cancelled
    </span>
  );
}

export default async function AccountPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [profileResult, ordersResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("name, email")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("orders")
      .select("id, status, total, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  if (profileResult.error) {
    throw new Error("Failed to load account profile.");
  }

  if (ordersResult.error) {
    throw new Error("Failed to load account orders.");
  }

  const profile = profileResult.data;
  const orders = ordersResult.data ?? [];
  const email = profile?.email ?? user.email ?? "";
  const displayName =
    profile?.name?.trim() ||
    email.split("@")[0] ||
    "Customer";

  return (
    <div className="min-h-screen bg-background pb-20 pt-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-16 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h1 className="mb-2 text-4xl font-light">My Account</h1>
            <p className="text-muted-foreground">
              Welcome back, <span className="font-medium text-foreground">{displayName}</span>
            </p>
          </div>

          <SignOutButton className="rounded-full border border-border px-6 py-2 text-sm font-medium transition-colors hover:bg-muted" />
        </div>

        <div className="grid gap-12 lg:grid-cols-3">
          <div className="space-y-8">
            <div className="rounded-3xl border border-border bg-card p-8">
              <h2 className="mb-6 text-xl font-bold">Profile Details</h2>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">Name</p>
                  <p className="font-medium">{displayName}</p>
                </div>
                <div>
                  <p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">Email</p>
                  <p className="font-medium">{email || "No email found"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h2 className="mb-8 flex items-center gap-3 text-2xl font-light">
              <Package className="h-6 w-6 text-primary" />
              Order History
            </h2>

            {orders.length === 0 ? (
              <div className="rounded-3xl border border-border bg-card p-10 text-center text-muted-foreground">
                You have no orders yet. Place your first order to see history here.
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-3xl border border-border bg-card p-6 transition-colors hover:border-primary/30"
                  >
                    <div className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
                      <div>
                        <div className="mb-1 flex items-center gap-3">
                          <h3 className="text-lg font-bold">{order.id}</h3>
                          <StatusBadge status={order.status} />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Placed on {formatOrderDate(order.created_at)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="mb-1 text-sm text-muted-foreground">Total Amount</p>
                        <p className="text-xl font-bold">{currencyFormatter.format(Number(order.total))}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
