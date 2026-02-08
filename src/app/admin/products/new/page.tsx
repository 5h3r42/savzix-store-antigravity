"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, Loader2, Save } from "lucide-react";

export default function NewProductPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      alert("Product created successfully! (Simulation)");
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/products" className="p-2 hover:bg-muted rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Add New Product</h1>
            <p className="text-muted-foreground">Create a new product in your catalog</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-8">
                {/* Basic Info */}
                <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                    <h2 className="font-bold text-lg mb-4">Basic Information</h2>
                    
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Product Title</label>
                        <input type="text" placeholder="e.g. Aurum Elixir Serum" className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:ring-1 focus:ring-primary focus:border-primary outline-none" required />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <textarea rows={6} placeholder="Product description..." className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:ring-1 focus:ring-primary focus:border-primary outline-none resize-none"></textarea>
                    </div>
                </div>

                {/* Media */}
                <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                    <h2 className="font-bold text-lg mb-4">Media</h2>
                    <div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary/50 hover:bg-muted/10 transition-all group">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            <Upload className="w-5 h-5" />
                        </div>
                        <p className="font-medium text-sm">Click to upload or drag and drop</p>
                        <p className="text-xs text-muted-foreground mt-1">SVG, PNG, JPG or GIF (max. 800x400px)</p>
                    </div>
                </div>

                {/* Variants (Simplified) */}
                <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="font-bold text-lg">Variants</h2>
                        <button type="button" className="text-sm text-primary font-medium hover:underline">+ Add Option</button>
                    </div>
                    <div className="p-4 bg-muted/20 rounded-lg border border-border flex items-center justify-between">
                        <span>Default Variant</span>
                        <span className="text-xs text-muted-foreground">Automatic</span>
                    </div>
                </div>
            </div>

            {/* Sidebar Column */}
            <div className="space-y-8">
                {/* Organization */}
                <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                    <h2 className="font-bold text-lg mb-4">Organization</h2>
                    
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Status</label>
                        <select className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:ring-1 focus:ring-primary focus:border-primary outline-none">
                            <option>Active</option>
                            <option>Draft</option>
                            <option>Archived</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Category</label>
                        <select className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:ring-1 focus:ring-primary focus:border-primary outline-none">
                            <option>Serums</option>
                            <option>Creams</option>
                            <option>Oils</option>
                            <option>Cleansers</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Collections</label>
                        <input type="text" placeholder="Search collections..." className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:ring-1 focus:ring-primary focus:border-primary outline-none" />
                    </div>
                </div>

                {/* Pricing & Inventory */}
                <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                    <h2 className="font-bold text-lg mb-4">Pricing & Inventory</h2>
                    
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Price</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                            <input type="number" placeholder="0.00" className="w-full bg-background border border-border rounded-lg pl-8 pr-4 py-2 focus:ring-1 focus:ring-primary focus:border-primary outline-none" />
                        </div>
                    </div>

                    <div className="space-y-2">
                         <label className="text-sm font-medium">Compare at price</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                            <input type="number" placeholder="0.00" className="w-full bg-background border border-border rounded-lg pl-8 pr-4 py-2 focus:ring-1 focus:ring-primary focus:border-primary outline-none" />
                        </div>
                    </div>

                    <div className="border-t border-border my-4 pt-4 space-y-2">
                        <label className="text-sm font-medium">Stock Quantity</label>
                        <input type="number" placeholder="0" className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:ring-1 focus:ring-primary focus:border-primary outline-none" />
                    </div>
                </div>
            </div>
        </div>

        <div className="flex items-center justify-end gap-4 border-t border-border pt-6">
            <button type="button" className="px-6 py-2 rounded-lg hover:bg-muted transition-colors font-medium">Cancel</button>
            <button 
                type="submit" 
                disabled={isLoading}
                className="bg-primary text-primary-foreground px-8 py-2 rounded-lg font-bold hover:opacity-90 transition-opacity flex items-center gap-2"
            >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Product
            </button>
        </div>
      </form>
    </div>
  );
}
