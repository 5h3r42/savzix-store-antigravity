"use client";

import { Search, Mail, Phone, MoreHorizontal } from "lucide-react";

export default function AdminCustomers() {
  const customers = [
    { id: 1, name: "Elena Fisher", email: "elena@example.com", phone: "+1 (555) 123-4567", orders: 12, spent: "$1,240.00", lastActive: "2 hours ago" },
    { id: 2, name: "Nathan Drake", email: "nate@example.com", phone: "+1 (555) 987-6543", orders: 8, spent: "$850.00", lastActive: "1 day ago" },
    { id: 3, name: "Chloe Frazer", email: "chloe@example.com", phone: "+1 (555) 456-7890", orders: 5, spent: "$420.00", lastActive: "3 days ago" },
    { id: 4, name: "Victor Sullivan", email: "sully@example.com", phone: "+1 (555) 234-5678", orders: 24, spent: "$3,100.00", lastActive: "5 hours ago" },
    { id: 5, name: "Sam Drake", email: "sam@example.com", phone: "+1 (555) 876-5432", orders: 3, spent: "$150.00", lastActive: "1 week ago" },
    { id: 6, name: "Nadine Ross", email: "nadine@example.com", phone: "+1 (555) 345-6789", orders: 15, spent: "$2,400.00", lastActive: "2 days ago" },
    { id: 7, name: "Rafe Adler", email: "rafe@example.com", phone: "+1 (555) 654-3210", orders: 2, spent: "$900.00", lastActive: "4 days ago" },
    { id: 8, name: "Harry Flynn", email: "flynn@example.com", phone: "+1 (555) 789-0123", orders: 1, spent: "$65.00", lastActive: "2 weeks ago" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">Manage your customer base and view their activity.</p>
        </div>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors">
            Add Customer
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {/* Search */}
        <div className="p-4 border-b border-border">
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                    type="text" 
                    placeholder="Search customers by name or email..." 
                    className="w-full pl-10 pr-4 py-2 bg-muted/30 border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
                />
            </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-muted/30 uppercase tracking-wider text-muted-foreground font-medium border-b border-border">
                    <tr>
                        <th className="px-6 py-4">Customer</th>
                        <th className="px-6 py-4">Contact Info</th>
                        <th className="px-6 py-4 text-center">Orders</th>
                        <th className="px-6 py-4 text-right">Total Spent</th>
                        <th className="px-6 py-4">Last Active</th>
                        <th className="px-6 py-4 text-center">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {customers.map((customer) => (
                        <tr key={customer.id} className="hover:bg-muted/20 transition-colors group">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                                        {customer.name.slice(0, 2).toUpperCase()}
                                    </div>
                                    <span className="font-medium">{customer.name}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-muted-foreground">
                                <div className="flex flex-col gap-1 text-xs">
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-3 h-3" />
                                        {customer.email}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-3 h-3" />
                                        {customer.phone}
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-center font-medium">{customer.orders}</td>
                            <td className="px-6 py-4 text-right font-bold text-primary">{customer.spent}</td>
                            <td className="px-6 py-4 text-muted-foreground">{customer.lastActive}</td>
                            <td className="px-6 py-4 text-center">
                                <button className="p-2 hover:bg-muted rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                                    <MoreHorizontal className="w-4 h-4" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
            <span>Showing 1-8 of 145 customers</span>
            <div className="flex gap-2">
                <button className="px-3 py-1 border border-border rounded hover:bg-muted transition-colors disabled:opacity-50" disabled>Previous</button>
                <button className="px-3 py-1 border border-border rounded hover:bg-muted transition-colors">Next</button>
            </div>
        </div>
      </div>
    </div>
  );
}
