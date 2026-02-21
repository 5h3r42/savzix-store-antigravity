import Image from "next/image";
import Link from "next/link";
import { Plus, Search, Filter, Eye, Edit, Trash2 } from "lucide-react";
import { getAllProducts } from "@/lib/products-store";
import type { Product } from "@/types/product";

export const dynamic = "force-dynamic";

function formatPrice(price: number) {
  return `$${price.toFixed(2)}`;
}

function getInventoryStatus(product: Product) {
  if (product.status !== "Active") {
    return product.status;
  }

  if (product.stock === 0) {
    return "Out of Stock";
  }

  if (product.stock < 15) {
    return "Low Stock";
  }

  return product.status;
}

export default async function AdminProductsPage() {
  const products = await getAllProducts();

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Link>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products..."
            className="w-full rounded-lg border border-border bg-card py-2 pl-10 pr-4 transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 transition-colors hover:bg-muted">
          <Filter className="h-4 w-4" />
          Filters
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="px-6 py-4 font-medium text-muted-foreground">Product</th>
                <th className="px-6 py-4 font-medium text-muted-foreground">Category</th>
                <th className="px-6 py-4 font-medium text-muted-foreground">Price</th>
                <th className="px-6 py-4 font-medium text-muted-foreground">Stock</th>
                <th className="px-6 py-4 font-medium text-muted-foreground">Status</th>
                <th className="px-6 py-4 text-right font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((product) => {
                const inventoryStatus = getInventoryStatus(product);

                return (
                  <tr
                    key={product.id}
                    className="group transition-colors hover:bg-muted/30"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                          <Image
                            src={product.image || "/product_bottle.png"}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium transition-colors group-hover:text-primary">
                            {product.name}
                          </p>
                          <p className="text-xs text-muted-foreground">{product.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{product.category}</td>
                    <td className="px-6 py-4 font-medium">
                      {formatPrice(product.price)}
                    </td>
                    <td className="px-6 py-4">{product.stock}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={inventoryStatus} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-border px-6 py-4 text-sm">
          <p className="text-muted-foreground">
            Showing {products.length === 0 ? 0 : 1}-{products.length} of {products.length} products
          </p>
          <div className="flex gap-2">
            <button
              className="rounded border border-border px-3 py-1 transition-colors hover:bg-muted disabled:opacity-50"
              disabled
            >
              Previous
            </button>
            <button className="rounded border border-border px-3 py-1 transition-colors hover:bg-muted disabled:opacity-50">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Active: "border-green-500/20 bg-green-500/10 text-green-500",
    Draft: "border-zinc-500/20 bg-zinc-500/10 text-zinc-400",
    Archived: "border-zinc-500/20 bg-zinc-500/10 text-zinc-400",
    "Low Stock": "border-yellow-500/20 bg-yellow-500/10 text-yellow-500",
    "Out of Stock": "border-red-500/20 bg-red-500/10 text-red-500",
  };

  return (
    <span
      className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[status] || "border-gray-500/20 bg-gray-500/10 text-gray-500"}`}
    >
      {status}
    </span>
  );
}
