import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getProductById } from "@/lib/api/catalog/products";
import { getAllCategories } from "@/lib/api/catalog/categories";
import { ProductForm } from "@/components/products/product-form";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [productResult, categoriesResult] = await Promise.all([
    getProductById(id),
    getAllCategories(),
  ]);

  if (!productResult.success) notFound();

  const categories = categoriesResult.success ? categoriesResult.data : [];

  return (
    <>
      <Link
        href="/admin/products"
        className="mb-4 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        Back to products
      </Link>
      <ProductForm categories={categories} product={productResult.data} />
    </>
  );
}