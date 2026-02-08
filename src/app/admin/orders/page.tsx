"use client";

import { Eye, MoreHorizontal, Search, Filter } from "lucide-react";

export default function AdminOrders() {
  const orders = [
    { id: "#ORD-7752", customer: "Elena Fisher", date: "Oct 24, 2025", status: "Processing", total: "$240.00", items: 3 },
    { id: "#ORD-7751", customer: "Nathan Drake", date: "Oct 24, 2025", status: "Completed", total: "$120.00", items: 1 },
    { id: "#ORD-7750", customer: "Chloe Frazer", date: "Oct 23, 2025", status: "Shipped", total: "$85.00", items: 2 },
    { id: "#ORD-7749", customer: "Victor Sullivan", date: "Oct 23, 2025", status: "Completed", total: "$310.00", items: 4 },
    { id: "#ORD-7748", customer: "Sam Drake", date: "Oct 22, 2025", status: "Cancelled", total: "$55.00", items: 1 },
    { id: "#ORD-7747", customer: "Nadine Ross", date: "Oct 22, 2025", status: "Shipped", total: "$190.00", items: 2 },
    { id: "#ORD-7746", customer: "Rafe Adler", date: "Oct 21, 2025", status: "Processing", total: "$450.00", items: 5 },
    { id: "#ORD-7745", customer: "Harry Flynn", date: "Oct 20, 2025", status: "Completed", total: "$65.00", items: 1 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">Manage and track customer orders.</p>
        </div>
        <div className="flex items-center gap-2">
            <button className="px-4 py-2 bg-card border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filter
            </button>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors">
                Export Orders
            </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {/* Search & Actions */}
        <div className="p-4 border-b border-border flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                    type="text" 
                    placeholder="Search orders..." 
                    className="w-full pl-10 pr-4 py-2 bg-muted/30 border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
                />
            </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-muted/30 uppercase tracking-wider text-muted-foreground font-medium border-b border-border">
                    <tr>
                        <th className="px-6 py-4">Order ID</th>
                        <th className="px-6 py-4">Customer</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Items</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Total</th>
                        <th className="px-6 py-4 text-center">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-muted/20 transition-colors group">
                            <td className="px-6 py-4 font-medium text-primary">{order.id}</td>
                            <td className="px-6 py-4 font-medium">{order.customer}</td>
                            <td className="px-6 py-4 text-muted-foreground">{order.date}</td>
                            <td className="px-6 py-4 text-muted-foreground">{order.items} items</td>
                            <td className="px-6 py-4">
                                <StatusBadge status={order.status} />
                            </td>
                            <td className="px-6 py-4 text-right font-bold">{order.total}</td>
                            <td className="px-6 py-4">
                                <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors">
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
            <span>Showing 1-8 of 24 orders</span>
            <div className="flex gap-2">
                <button className="px-3 py-1 border border-border rounded hover:bg-muted transition-colors disabled:opacity-50" disabled>Previous</button>
                <button className="px-3 py-1 border border-border rounded hover:bg-muted transition-colors">Next</button>
            </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        Processing: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        Completed: "bg-green-500/10 text-green-500 border-green-500/20",
        Shipped: "bg-purple-500/10 text-purple-500 border-purple-500/20",
        Cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
        Pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    };
    
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || "bg-gray-500/10 text-gray-500"}`}>
            {status}
        </span>
    );
}
