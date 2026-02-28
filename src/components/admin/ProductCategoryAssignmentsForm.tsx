"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import type {
  CategoryAssignment,
  CategoryOption,
} from "@/types/category-taxonomy";

type ProductCategoryAssignmentsFormProps = {
  productId: string;
  productName: string;
  legacyCategory: string;
  categories: CategoryOption[];
  assignments: CategoryAssignment[];
};

function formatCategoryLabel(category: CategoryOption) {
  return category.path
    ?.split("/")
    .map((segment) =>
      segment
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" "),
    )
    .join(" / ") ?? category.name;
}

export function ProductCategoryAssignmentsForm({
  productId,
  productName,
  legacyCategory,
  categories,
  assignments,
}: ProductCategoryAssignmentsFormProps) {
  const router = useRouter();
  const initialPrimaryCategoryId = assignments.find((assignment) => assignment.isPrimary)?.categoryId ?? "";
  const initialSecondaryCategoryIds = assignments
    .filter((assignment) => !assignment.isPrimary)
    .map((assignment) => assignment.categoryId);

  const [primaryCategoryId, setPrimaryCategoryId] = useState(initialPrimaryCategoryId);
  const [secondaryCategoryIds, setSecondaryCategoryIds] = useState(initialSecondaryCategoryIds);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const categoryOptions = useMemo(
    () =>
      categories.map((category) => ({
        ...category,
        label: formatCategoryLabel(category),
      })),
    [categories],
  );

  const toggleSecondaryCategory = (categoryId: string) => {
    setSecondaryCategoryIds((current) =>
      current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId],
    );
  };

  const handleSave = async () => {
    if (!primaryCategoryId) {
      setError("Select a primary category before saving.");
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const payload = {
        primaryCategoryId,
        secondaryCategoryIds: secondaryCategoryIds.filter(
          (categoryId) => categoryId !== primaryCategoryId,
        ),
      };

      const response = await fetch(`/api/admin/products/${encodeURIComponent(productId)}/categories`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseBody = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        throw new Error(responseBody?.error ?? "Failed to save category assignments.");
      }

      setSuccessMessage("Category assignments saved.");
      router.refresh();
    } catch (saveError) {
      const message =
        saveError instanceof Error
          ? saveError.message
          : "Failed to save category assignments.";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-20">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Categories</h1>
          <p className="text-muted-foreground">
            Assign the canonical taxonomy for {productName}.
          </p>
        </div>
        <Link
          href="/admin/products"
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
        >
          Back to Products
        </Link>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground">Current Product</h2>
        <dl className="mt-4 grid gap-4 text-sm md:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Product</dt>
            <dd className="mt-1 font-medium text-foreground">{productName}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Legacy category</dt>
            <dd className="mt-1 font-medium text-foreground">{legacyCategory}</dd>
          </div>
        </dl>
      </div>

      <div className="space-y-6 rounded-xl border border-border bg-card p-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Primary Category</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            One primary category is required for canonical routing and SEO.
          </p>
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-foreground">Primary category</span>
          <select
            value={primaryCategoryId}
            onChange={(event) => setPrimaryCategoryId(event.target.value)}
            className="w-full rounded-lg border border-border bg-background px-4 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value="">Select a category</option>
            {categoryOptions.map((category) => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="space-y-6 rounded-xl border border-border bg-card p-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Secondary Categories</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Add optional secondary placements without changing the canonical primary path.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {categoryOptions.map((category) => {
            const isPrimary = category.id === primaryCategoryId;
            const checked = isPrimary || secondaryCategoryIds.includes(category.id);

            return (
              <label
                key={category.id}
                className="flex items-start gap-3 rounded-lg border border-border bg-background px-4 py-3 text-sm"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={isPrimary}
                  onChange={() => toggleSecondaryCategory(category.id)}
                  className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <span>
                  <span className="block font-medium text-foreground">{category.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {category.path ?? category.name}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      {successMessage ? (
        <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-300">
          {successMessage}
        </div>
      ) : null}

      <div className="flex items-center justify-end gap-4 border-t border-border pt-6">
        <Link
          href="/admin/products"
          className="rounded-lg px-6 py-2 font-medium transition-colors hover:bg-muted"
        >
          Cancel
        </Link>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-2 font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-70"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Categories
        </button>
      </div>
    </div>
  );
}
