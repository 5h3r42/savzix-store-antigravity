"use client";

import Link from "next/link";
import { Plus, Search, Filter, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";

const products = [
  {
    id: "PROD-001",
    name: "Aurum Elixir Serum",
    category: "Serums",
    price: "$120.00",
    stock: 45,
    status: "Active",
    image: "/product_bottle.png"
  },
  {
    id: "PROD-002",
    name: "Nocturnal Radiance",
    category: "Creams",
    price: "$95.00",
    stock: 12,
    status: "Low Stock",
    image: "/product_bottle.png"
  },
  {
    id: "PROD-003",
    name: "Solar Glow Oil",
    category: "Oils",
    price: "$65.00",
    stock: 0,
    status: "Out of Stock",
    image: "/product_bottle.png"
  },
  {
    id: "PROD-004",
    name: "Pure Essence Balm",
    category: "Cleansers",
    price: "$55.00",
    stock: 88,
    status: "Active",
    image: "/product_bottle.png"
  }
];

export default function AdminProductsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <Link 
          href="/admin/products/new" 
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search products..." 
            className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
          />
        </div>
        <button className="px-4 py-2 bg-card border border-border rounded-lg flex items-center gap-2 hover:bg-muted transition-colors">
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium text-muted-foreground">Product</th>
                <th className="px-6 py-4 font-medium text-muted-foreground">Category</th>
                <th className="px-6 py-4 font-medium text-muted-foreground">Price</th>
                <th className="px-6 py-4 font-medium text-muted-foreground">Stock</th>
                <th className="px-6 py-4 font-medium text-muted-foreground">Status</th>
                <th className="px-6 py-4 font-medium text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((product) => (
                <tr key={product.id} className="group hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex-shrink-0"></div>
                      <div>
                        <p className="font-medium group-hover:text-primary transition-colors">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{product.category}</td>
                  <td className="px-6 py-4 font-medium">{product.price}</td>
                  <td className="px-6 py-4">{product.stock}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={product.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                        <button className="p-2 hover:bg-background rounded-lg text-muted-foreground hover:text-foreground transition-colors" title="View">
                            <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 hover:bg-background rounded-lg text-muted-foreground hover:text-foreground transition-colors" title="Edit">
                            <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 hover:bg-red-500/10 rounded-lg text-muted-foreground hover:text-red-500 transition-colors" title="Delete">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="border-t border-border px-6 py-4 flex items-center justify-between text-sm">
            <p className="text-muted-foreground">Showing 1-4 of 12 products</p>
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
    "Active": "bg-green-500/10 text-green-500 border-green-500/20",
    "Low Stock": "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    "Out of Stock": "bg-red-500/10 text-red-500 border-red-500/20",
  };
  
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || "bg-gray-500/10 text-gray-500 border-gray-500/20"}`}>
      {status}
    </span>
  );
}
