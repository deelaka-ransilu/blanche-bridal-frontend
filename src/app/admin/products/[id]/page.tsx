import { notFound } from "next/navigation";
import { getProductById } from "@/lib/api/products";
import { getAllCategories } from "@/lib/api/categories";
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

  return <ProductForm categories={categories} product={productResult.data} />;
}