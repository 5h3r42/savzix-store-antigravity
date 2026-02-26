"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import type { ProductStatus } from "@/types/product";

type ProductFormState = {
  name: string;
  description: string;
  category: string;
  status: ProductStatus;
  price: string;
  stock: string;
  image: string;
};

const initialFormState: ProductFormState = {
  name: "",
  description: "",
  category: "Serums",
  status: "Active",
  price: "",
  stock: "10",
  image: "/product_bottle.png",
};

export default function NewProductPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [form, setForm] = useState<ProductFormState>(initialFormState);

  const uploadImage = async (file: File) => {
    setIsUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/uploads", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json().catch(() => null)) as
        | { error?: string; url?: string }
        | null;

      if (!response.ok || !payload?.url) {
        throw new Error(payload?.error ?? "Failed to upload image.");
      }

      return payload.url;
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleUploadClick = async () => {
    if (!imageFile) {
      setError("Select an image first.");
      return;
    }

    setError(null);

    try {
      const uploadedUrl = await uploadImage(imageFile);
      setForm((prev) => ({ ...prev, image: uploadedUrl }));
      setImageFile(null);
    } catch (uploadError) {
      const message =
        uploadError instanceof Error
          ? uploadError.message
          : "Failed to upload image.";
      setError(message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      let imageValue = form.image;

      if (imageFile) {
        imageValue = await uploadImage(imageFile);
        setForm((prev) => ({ ...prev, image: imageValue }));
        setImageFile(null);
      }

      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          category: form.category,
          status: form.status,
          price: Number(form.price),
          stock: Number(form.stock),
          image: imageValue,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;

        throw new Error(payload?.error ?? "Failed to create product.");
      }

      router.push("/admin/products");
      router.refresh();
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Failed to create product.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl pb-20">
      <div className="mb-8 flex items-center gap-4">
        <Link
          href="/admin/products"
          className="rounded-full p-2 transition-colors hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Product</h1>
          <p className="text-muted-foreground">
            Create a new product in your catalog
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <div className="space-y-4 rounded-xl border border-border bg-card p-6">
              <h2 className="mb-4 text-lg font-bold">Basic Information</h2>

              <div className="space-y-2">
                <label className="text-sm font-medium">Product Title</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Aurum Elixir Serum"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  rows={6}
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Product description..."
                  className="w-full resize-none rounded-lg border border-border bg-background px-4 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  required
                />
              </div>
            </div>

            <div className="space-y-4 rounded-xl border border-border bg-card p-6">
              <h2 className="mb-4 text-lg font-bold">Media</h2>
              <div className="space-y-2">
                <label className="text-sm font-medium">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) =>
                    setImageFile(event.target.files?.[0] ?? null)
                  }
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm outline-none file:mr-3 file:rounded file:border-0 file:bg-primary/10 file:px-3 file:py-1 file:text-xs file:font-medium file:text-primary focus:border-primary focus:ring-1 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={handleUploadClick}
                  disabled={isUploadingImage || !imageFile}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isUploadingImage ? "Uploading..." : "Upload Selected Image"}
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Image Path</label>
                <input
                  type="text"
                  value={form.image}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, image: e.target.value }))
                  }
                  placeholder="/product_bottle.png"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
                <p className="text-xs text-muted-foreground">
                  Upload to Supabase storage or enter a URL/manual image path.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-4 rounded-xl border border-border bg-card p-6">
              <h2 className="mb-4 text-lg font-bold">Organization</h2>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      status: e.target.value as ProductStatus,
                    }))
                  }
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  <option>Active</option>
                  <option>Draft</option>
                  <option>Archived</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, category: e.target.value }))
                  }
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  <option>Serums</option>
                  <option>Creams</option>
                  <option>Oils</option>
                  <option>Cleansers</option>
                  <option>Wellness</option>
                </select>
              </div>
            </div>

            <div className="space-y-4 rounded-xl border border-border bg-card p-6">
              <h2 className="mb-4 text-lg font-bold">Pricing & Inventory</h2>

              <div className="space-y-2">
                <label className="text-sm font-medium">Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, price: e.target.value }))
                    }
                    placeholder="0.00"
                    className="w-full rounded-lg border border-border bg-background py-2 pl-8 pr-4 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2 border-t border-border pt-4">
                <label className="text-sm font-medium">Stock Quantity</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.stock}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, stock: e.target.value }))
                  }
                  placeholder="0"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-4 border-t border-border pt-6">
          <Link
            href="/admin/products"
            className="rounded-lg px-6 py-2 font-medium transition-colors hover:bg-muted"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isLoading || isUploadingImage}
            className="flex items-center gap-2 rounded-lg bg-primary px-8 py-2 font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-70"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Product
          </button>
        </div>
      </form>
    </div>
  );
}
