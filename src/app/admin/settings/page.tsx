"use client";

import { useState } from "react";
import { Save, Globe, CreditCard, Truck, Shield } from "lucide-react";

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("general");

  const tabs = [
    { id: "general", label: "General", icon: Globe },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "shipping", label: "Shipping", icon: Truck },
    { id: "security", label: "Security", icon: Shield },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your store configuration and preferences.</p>
        </div>
        <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors flex items-center gap-2">
            <Save className="w-4 h-4" />
            Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="bg-card border border-border rounded-2xl p-4 h-fit">
            <nav className="flex flex-col gap-1">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                            activeTab === tab.id 
                                ? "bg-primary/10 text-primary" 
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                    >
                        <tab.icon className="w-5 h-5" />
                        {tab.label}
                    </button>
                ))}
            </nav>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-6">
            {activeTab === "general" && (
                <div className="bg-card border border-border rounded-2xl p-6 space-y-6 animate-fade-in-up">
                    <h2 className="text-xl font-bold border-b border-border pb-4">General Settings</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Store Name</label>
                            <input type="text" defaultValue="Savzix Store" className="w-full px-4 py-2 bg-muted/30 border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Support Email</label>
                            <input type="email" defaultValue="support@savzix.com" className="w-full px-4 py-2 bg-muted/30 border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Currency</label>
                            <select className="w-full px-4 py-2 bg-muted/30 border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary">
                                <option>USD ($)</option>
                                <option>EUR (€)</option>
                                <option>GBP (£)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Timezone</label>
                            <select className="w-full px-4 py-2 bg-muted/30 border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary">
                                <option>UTC</option>
                                <option>EST</option>
                                <option>PST</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "payments" && (
                <div className="bg-card border border-border rounded-2xl p-6 space-y-6 animate-fade-in-up">
                     <h2 className="text-xl font-bold border-b border-border pb-4">Payment Methods</h2>
                     <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border border-border rounded-xl">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-blue-500/10 text-blue-500 rounded-lg flex items-center justify-center font-bold">S</div>
                                <div>
                                    <h3 className="font-bold">Stripe</h3>
                                    <p className="text-sm text-muted-foreground">Processes credit cards and fast checkout.</p>
                                </div>
                            </div>
                            <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                                <input type="checkbox" name="toggle" id="toggle" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer border-primary"/>
                                <label htmlFor="toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-primary cursor-pointer"></label>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-4 border border-border rounded-xl opacity-50">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-blue-800/10 text-blue-800 rounded-lg flex items-center justify-center font-bold">P</div>
                                <div>
                                    <h3 className="font-bold">PayPal</h3>
                                    <p className="text-sm text-muted-foreground">Accept PayPal payments.</p>
                                </div>
                            </div>
                            <button className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted">Connect</button>
                        </div>
                     </div>
                </div>
            )}

            {activeTab === "shipping" && (
                <div className="bg-card border border-border rounded-2xl p-6 space-y-6 animate-fade-in-up">
                    <h2 className="text-xl font-bold border-b border-border pb-4">Shipping Zones</h2>
                    <div className="space-y-4">
                        <div className="p-4 border border-border rounded-xl">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-bold">Domestic (US)</h3>
                                <button className="text-primary text-sm font-bold">Edit</button>
                            </div>
                            <p className="text-sm text-muted-foreground">Standard: $5.00, Express: $15.00</p>
                        </div>
                        <div className="p-4 border border-border rounded-xl">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-bold">International</h3>
                                <button className="text-primary text-sm font-bold">Edit</button>
                            </div>
                            <p className="text-sm text-muted-foreground">Standard: $25.00</p>
                        </div>
                        <button className="w-full py-3 border border-border border-dashed rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                            + Add Shipping Zone
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
