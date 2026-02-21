"use client";

import {
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  type LucideIcon,
} from "lucide-react";

type Trend = "up" | "down";

type StatCardProps = {
  title: string;
  value: string;
  change: string;
  trend: Trend;
  icon: LucideIcon;
};

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value="$45,231.89"
          change="+20.1%"
          trend="up"
          icon={DollarSign}
        />
        <StatCard
          title="Total Orders"
          value="+2350"
          change="+180.1%"
          trend="up"
          icon={ShoppingCart}
        />
        <StatCard
          title="Active Now"
          value="+573"
          change="+19%"
          trend="up"
          icon={Users}
        />
        <StatCard
          title="Low Stock"
          value="12"
          change="-4%"
          trend="down"
          icon={Package}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Section (Placeholder) */}
        <div className="lg:col-span-2 bg-card border border-border rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-xl">Revenue Overview</h3>
            <div className="flex gap-2">
              <span className="px-3 py-1 rounded-full bg-muted text-xs font-medium cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                Daily
              </span>
              <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium cursor-pointer">
                Weekly
              </span>
              <span className="px-3 py-1 rounded-full bg-muted text-xs font-medium cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                Monthly
              </span>
            </div>
          </div>

          <div className="h-[300px] w-full flex items-end justify-between gap-2 px-2">
            {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 95].map((h, i) => (
              <div
                key={i}
                className="group relative w-full h-full bg-muted/20 rounded-t-xl hover:bg-primary/10 transition-colors flex items-end overflow-hidden"
              >
                <div
                  style={{ height: `${h}%` }}
                  className="w-full bg-primary/80 group-hover:bg-primary transition-all duration-500 rounded-t-lg relative"
                ></div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-xs text-muted-foreground px-2">
            <span>Jan</span>
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
            <span>Jun</span>
            <span>Jul</span>
            <span>Aug</span>
            <span>Sep</span>
            <span>Oct</span>
            <span>Nov</span>
            <span>Dec</span>
          </div>
        </div>

        {/* Recent Activity / Best Sellers */}
        <div className="bg-card border border-border rounded-3xl p-6">
          <h3 className="font-bold text-xl mb-6">Best Selling</h3>
          <div className="space-y-6">
            {[
              { name: "Aurum Elixir Serum", sales: "1,234", price: "$120" },
              { name: "Nocturnal Radiance", sales: "856", price: "$95" },
              { name: "Solar Glow Oil", sales: "654", price: "$65" },
              { name: "Pure Essence Balm", sales: "432", price: "$55" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-muted group-hover:bg-primary/20 transition-colors flex items-center justify-center font-bold text-muted-foreground group-hover:text-primary">
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-medium group-hover:text-primary transition-colors">
                      {item.name}
                    </p>
                    <p className="text-sm text-muted-foreground">{item.sales} sales</p>
                  </div>
                </div>
                <span className="font-bold">{item.price}</span>
              </div>
            ))}
          </div>

          <button className="w-full mt-8 py-3 rounded-xl border border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all text-sm font-bold uppercase tracking-wider">
            View All Products
          </button>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-card border border-border rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <h3 className="font-bold text-xl">Recent Orders</h3>
          <button className="text-primary text-sm font-medium hover:underline">See all</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                {
                  id: "#ORD-7752",
                  customer: "Elena Fisher",
                  date: "Just now",
                  status: "Processing",
                  total: "$240.00",
                },
                {
                  id: "#ORD-7751",
                  customer: "Nathan Drake",
                  date: "2 min ago",
                  status: "Completed",
                  total: "$120.00",
                },
                {
                  id: "#ORD-7750",
                  customer: "Chloe Frazer",
                  date: "15 min ago",
                  status: "Shipped",
                  total: "$85.00",
                },
                {
                  id: "#ORD-7749",
                  customer: "Victor Sullivan",
                  date: "1 hour ago",
                  status: "Completed",
                  total: "$310.00",
                },
                {
                  id: "#ORD-7748",
                  customer: "Sam Drake",
                  date: "3 hours ago",
                  status: "Pending",
                  total: "$55.00",
                },
              ].map((order, i) => (
                <tr key={i} className="hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4 font-medium text-primary">{order.id}</td>
                  <td className="px-6 py-4">{order.customer}</td>
                  <td className="px-6 py-4 text-muted-foreground text-sm">{order.date}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4 text-right font-medium">{order.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, trend, icon: Icon }: StatCardProps) {
  const isPositive = trend === "up";

  return (
    <div className="bg-card p-6 rounded-3xl border border-border hover:border-primary/50 transition-all duration-300 group">
      <div className="flex justify-between items-start mb-4">
        <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
          <Icon className="w-5 h-5" />
        </div>
        <div
          className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
            isPositive ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
          }`}
        >
          {isPositive ? (
            <ArrowUpRight className="w-3 h-3" />
          ) : (
            <ArrowDownRight className="w-3 h-3" />
          )}
          {change}
        </div>
      </div>
      <p className="text-muted-foreground text-sm mb-1">{title}</p>
      <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Processing: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    Completed: "bg-green-500/10 text-green-500 border-green-500/20",
    Shipped: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    Pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status] || "bg-gray-500/10 text-gray-500"}`}
    >
      {status}
    </span>
  );
}
