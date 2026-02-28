import { notFound } from "next/navigation";
import { ProductCategoryAssignmentsForm } from "@/components/admin/ProductCategoryAssignmentsForm";
import {
  getActiveCategoryOptions,
  getProductCategoryAssignments,
} from "@/lib/category-taxonomy";
import { getProductById } from "@/lib/products-store";

export const dynamic = "force-dynamic";

type ProductCategoryAssignmentsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProductCategoryAssignmentsPage({
  params,
}: ProductCategoryAssignmentsPageProps) {
  const { id } = await params;
  const [product, categories, assignments] = await Promise.all([
    getProductById(id),
    getActiveCategoryOptions(),
    getProductCategoryAssignments(id),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <ProductCategoryAssignmentsForm
      productId={product.id}
      productName={product.name}
      legacyCategory={product.category}
      categories={categories}
      assignments={assignments}
    />
  );
}
