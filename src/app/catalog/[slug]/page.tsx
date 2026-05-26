"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ProductDetail, Review } from "@/types";
import { getProductBySlug, getProductReviews } from "@/lib/api/products";
import { ProductGallery } from "@/features/products/components/ProductGallery";
import { ProductInfo } from "@/features/products/components/ProductInfo";
import { ReviewSection } from "@/features/products/components/ReviewSection";
import { PublicNav } from "@/components/shared/PublicNav";

function ProductDetailSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="flex flex-col gap-3">
          <div className="aspect-[3/4] rounded-2xl bg-gray-200 animate-pulse" />
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-16 h-20 rounded-lg bg-gray-200 animate-pulse" />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-4 pt-2">
          <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
          <div className="h-7 w-3/4 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-1/3 bg-gray-200 rounded animate-pulse" />
          <div className="h-px bg-gray-200" />
          <div className="h-6 w-1/2 bg-gray-200 rounded animate-pulse" />
          <div className="flex gap-2 flex-wrap">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-12 h-8 rounded-lg bg-gray-200 animate-pulse" />
            ))}
          </div>
          <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse mt-4" />
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);   // ← separate state
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  async function loadProduct() {
    if (!slug) return;
    setLoading(true);
    try {
      const data = await getProductBySlug(slug);
      setProduct(data);

      // Fetch approved reviews separately — public endpoint, no token needed
      const fetchedReviews = await getProductReviews(data.id).catch(() => []);
      setReviews(fetchedReviews);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProduct();
  }, [slug]);

  if (!loading && notFound) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PublicNav />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <p className="text-lg font-medium text-gray-700">Product not found</p>
          <Link href="/catalog" className="text-sm text-amber-700 underline hover:text-amber-800">
            Back to collection
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNav />

      {loading || !product ? (
        <ProductDetailSkeleton />
      ) : (
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-8">
            <Link href="/catalog" className="hover:text-amber-700 transition-colors">
              Collection
            </Link>
            <span>/</span>
            {product.category && (
              <>
                <Link
                  href={`/catalog?categoryId=${product.category.id}`}
                  className="hover:text-amber-700 transition-colors"
                >
                  {product.category.name}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-gray-700 truncate max-w-[200px]">{product.name}</span>
          </nav>

          {/* Main layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14">
            <div>
              <ProductGallery images={product.images} productName={product.name} />
            </div>
            <div>
              <ProductInfo product={product} />
            </div>
          </div>

          {/* Reviews — now uses fetched reviews, not product.reviews */}
          <div className="mt-12 max-w-2xl">
            <ReviewSection
              productId={product.id}
              reviews={reviews}
              onReviewSubmitted={loadProduct}
            />
          </div>
        </div>
      )}
    </div>
  );
}