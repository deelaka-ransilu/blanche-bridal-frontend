import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Star } from "lucide-react";
import { getProductBySlug } from "@/lib/api/products";
import { PublicNav } from "@/components/public-nav";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getProductReviews } from "@/lib/api/reviews";
import { ReviewForm } from "@/components/reviews/review-form";
import { ReviewList } from "@/components/reviews/review-list";
import { ProductGallery } from "@/components/products/product-gallery";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getProductBySlug(slug);

  if (!result.success) notFound();
  const product = result.data;

  const session = await getServerSession(authOptions);
  const isCustomer = session?.user?.role === "CUSTOMER";

  const reviewsResult = await getProductReviews(product.id);
  const reviews = reviewsResult.success ? reviewsResult.data : [];
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      {/* Extra bottom padding on mobile (pb-32) clears the floating theme toggle
          (fixed bottom-24 right-6, ~h-11) so it never overlaps the last CTA/review
          content when the page is short. Desktop rarely needs it but pb-24 keeps
          things consistent there. */}
      <main className="mx-auto max-w-6xl px-6 pb-32 pt-28 sm:pb-24">
        <Link
          href="/products"
          className="mb-6 flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> Collection
        </Link>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr] lg:items-start">
          {/* Image + details card */}
          <div className="grid grid-cols-1 gap-8 rounded-3xl border border-border bg-card p-5 sm:grid-cols-2 sm:p-6">
            <ProductGallery images={product.images} productName={product.name} />

            <div className="flex flex-col">
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {product.category?.name ?? "Uncategorized"}
              </p>
              <h1 className="font-heading mb-3 text-2xl font-medium text-foreground">
                {product.name}
              </h1>

              {product.sizes.length > 0 && (
                <div className="mb-4">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Sizes
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {product.sizes.map((size) => (
                      <span
                        key={size}
                        className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground"
                      >
                        {size}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {product.description && (
                <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                  {product.description}
                </p>
              )}

              <div className="mb-3 flex flex-wrap items-center gap-2">
                {product.purchasePrice != null && (
                  <p className="text-lg font-medium text-foreground">
                    Rs {product.purchasePrice.toLocaleString("en-LK")}
                  </p>
                )}
                {product.rentalPrice != null && (
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                    Rs {product.rentalPrice.toLocaleString("en-LK")} to rent
                  </span>
                )}
                {product.purchasePrice == null && product.rentalPrice == null && (
                  <p className="text-lg font-medium text-foreground">Price on inquiry</p>
                )}
              </div>

              {avgRating && (
                <div className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                  <span className="font-medium text-foreground">{avgRating}</span>
                  <span>
                    · {reviews.length} review{reviews.length === 1 ? "" : "s"}
                  </span>
                </div>
              )}

              <div className="flex flex-nowrap gap-2 sm:flex-wrap sm:gap-3">
                <Link
                  href="/register"
                  className="inline-flex flex-1 items-center justify-center whitespace-nowrap rounded-full bg-primary px-4 py-2.5 text-xs font-medium text-white transition-colors hover:bg-primary/90 sm:flex-none sm:px-6 sm:py-3 sm:text-sm"
                >
                  Book a consultation
                </Link>

                {product.rentalPrice != null && (
                  <Link
                    href={`/products/${slug}/rent`}
                    className="inline-flex flex-1 items-center justify-center whitespace-nowrap rounded-full border border-primary px-4 py-2.5 text-xs font-medium text-primary transition-colors hover:bg-primary/5 sm:flex-none sm:px-6 sm:py-3 sm:text-sm"
                  >
                    Rent this dress
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Reviews — side column on lg:, stacked below on smaller screens */}
          <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 lg:h-fit lg:max-h-[36rem] lg:overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-heading text-lg font-medium text-foreground">Reviews</h2>
              {avgRating && (
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                  {avgRating} ★
                </span>
              )}
            </div>
            <ReviewList reviews={reviews} />
            {isCustomer && (
              <div className="mt-6 border-t border-border pt-6">
                <ReviewForm productId={product.id} />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}