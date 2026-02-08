"use client";

import Link from "next/link";
import { Package, Truck, CheckCircle, Clock } from "lucide-react";

export default function AccountPage() {
  return (
    <div className="min-h-screen bg-background pt-32 pb-20">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
            <div>
                <h1 className="text-4xl font-light mb-2">My Account</h1>
                <p className="text-muted-foreground">Welcome back, <span className="text-foreground font-medium">Elena Fisher</span></p>
            </div>
            <button className="px-6 py-2 border border-border rounded-full hover:bg-muted transition-colors text-sm font-medium">
                Sign Out
            </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
            {/* Sidebar / Profile Info */}
            <div className="space-y-8">
                <div className="bg-card border border-border rounded-3xl p-8">
                    <h2 className="text-xl font-bold mb-6">Profile Details</h2>
                    <div className="space-y-4 text-sm">
                        <div>
                            <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Name</p>
                            <p className="font-medium">Elena Fisher</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Email</p>
                            <p className="font-medium">elena.fisher@example.com</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Phone</p>
                            <p className="font-medium">+1 (555) 123-4567</p>
                        </div>
                    </div>
                    <button className="mt-8 text-primary text-sm hover:underline">Edit Profile</button>
                </div>

                <div className="bg-card border border-border rounded-3xl p-8">
                    <h2 className="text-xl font-bold mb-6">Default Address</h2>
                    <p className="text-sm leading-relaxed mb-4">
                        123 Ocean View Drive<br />
                        Suite 4B<br />
                        Santa Monica, CA 90401<br />
                        United States
                    </p>
                    <button className="text-primary text-sm hover:underline">Manage Addresses</button>
                </div>
            </div>

            {/* Main Content / Order History */}
            <div className="lg:col-span-2">
                <h2 className="text-2xl font-light mb-8 flex items-center gap-3">
                    <Package className="w-6 h-6 text-primary" />
                    Order History
                </h2>

                <div className="space-y-6">
                    {/* Order Component */}
                    {[
                        { id: "#ORD-7752", date: "Oct 24, 2024", total: "$240.00", status: "Processing", items: ["Aurum Elixir Serum", "Solar Glow Oil"] },
                        { id: "#ORD-7710", date: "Sep 12, 2024", total: "$85.00", status: "Delivered", items: ["Pure Essence Balm"] },
                        { id: "#ORD-7650", date: "Aug 05, 2024", total: "$190.00", status: "Delivered", items: ["Nocturnal Radiance", "Aurum Elixir Serum"] },
                    ].map((order, i) => (
                        <div key={i} className="bg-card border border-border rounded-3xl p-6 hover:border-primary/30 transition-colors group">
                            <div className="flex flex-wrap justify-between items-start gap-4 mb-6 pb-6 border-b border-border dashed">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="font-bold text-lg">{order.id}</h3>
                                        <StatusBadge status={order.status} />
                                    </div>
                                    <p className="text-sm text-muted-foreground">Placed on {order.date}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                                    <p className="font-bold text-xl">{order.total}</p>
                                </div>
                            </div>
                            
                            <div className="space-y-3 mb-6">
                                {order.items.map((item, j) => (
                                    <div key={j} className="flex items-center gap-3 text-sm">
                                        <div className="w-8 h-8 bg-muted rounded-lg"></div> {/* Placeholder img */}
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-4">
                                <button className="flex-1 py-3 border border-border rounded-xl text-sm font-bold hover:bg-muted transition-colors">
                                    View Details
                                </button>
                                {order.status === "Delivered" && (
                                    <button className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:opacity-90 transition-opacity">
                                        Buy Again
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
    if (status === "Delivered") {
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-medium border border-green-500/20"><CheckCircle className="w-3 h-3" /> Delivered</span>
    }
    if (status === "Processing") {
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/10 text-blue-500 text-xs font-medium border border-blue-500/20"><Truck className="w-3 h-3" /> Processing</span>
    }
    return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium"><Clock className="w-3 h-3" /> {status}</span>
}
