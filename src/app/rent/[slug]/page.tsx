import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ArrowLeft, Star } from "lucide-react";
import { PublicNav } from "@/components/public-nav";
import { SiteFooter } from "@/components/site-footer";
import { RentalBookingForm } from "@/components/rentals/rental-booking-form";
import { getProductBySlug } from "@/lib/api/products";
import { getProductReviews } from "@/lib/api/reviews";
import { ReviewForm } from "@/components/reviews/review-form";
import { ReviewList } from "@/components/reviews/review-list";

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function RentProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [result, session] = await Promise.all([
    getProductBySlug(slug),
    getServerSession(authOptions),
  ]);

  if (!result.success) {
    notFound();
  }

  const product = result.data;

  // A dress with no rentalPrice isn't part of the rent flow — send it back
  // to browsing rather than showing a booking form that can't work.
  if (product.type !== "DRESS" || product.rentalPrice == null) {
    notFound();
  }

  const isCustomer = session?.user?.role === "CUSTOMER";

  const reviewsResult = await getProductReviews(product.id);
  const reviews = reviewsResult.success ? reviewsResult.data : [];
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  const callbackUrl = encodeURIComponent(`/rent/${slug}`);

  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      <main className="mx-auto max-w-6xl px-6 pb-24 pt-24 sm:pt-28">
        <Link
          href="/rent"
          className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> Back to Rent
        </Link>

        {/* ── Top: image + core booking info, full width ── */}
        <div className="mt-6 grid grid-cols-1 gap-8 rounded-3xl border border-border bg-card p-5 sm:p-6 lg:grid-cols-2">
          {/* ---------- Image ---------- */}
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-primary/8">
            {product.images[0]?.url ? (
              <Image
                src={product.images[0].url}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="text-xs text-muted-foreground">
                  Image coming soon
                </span>
              </div>
            )}
          </div>

          {/* ---------- Details + booking ---------- */}
          <div className="flex flex-col">
            <p className="text-[11px] font-medium uppercase tracking-wide text-primary">
              {product.category?.name ?? "Dress"}
            </p>
            <h1 className="font-heading mt-1 text-2xl font-medium text-foreground sm:text-3xl">
              {product.name}
            </h1>

            {avgRating && (
              <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                <span className="font-medium text-foreground">{avgRating}</span>
                <span>
                  ({reviews.length} review{reviews.length === 1 ? "" : "s"})
                </span>
              </div>
            )}

            <p className="mt-2 text-lg text-foreground">
              {product.rentalPricePerDay != null ? (
                <>
                  {formatPrice(product.rentalPricePerDay)}{" "}
                  <span className="text-sm text-muted-foreground">/ day</span>
                </>
              ) : (
                <>
                  {formatPrice(product.rentalPrice)}{" "}
                  <span className="text-sm text-muted-foreground">/ rental</span>
                </>
              )}
            </p>

            {/* Size selection now lives inside RentalBookingForm itself (it's
                part of the booking submission, not just a display list) — see
                the "Size" control rendered above the date fields there. */}

            {product.description && (
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {product.description}
              </p>
            )}

            {!product.isAvailable && (
              <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
                This dress is currently out on rental. You can still request
                dates below — we&apos;ll confirm availability with you.
              </p>
            )}

            {/* ---------- Booking (login-gated) ---------- */}
            <div className="mt-auto pt-6">
              <div className="rounded-2xl border border-border bg-background p-5">
                <h2 className="mb-3 text-sm font-medium text-foreground">
                  Book a fitting
                </h2>
                {session ? (
                  <RentalBookingForm
                    productId={product.id}
                    rentalPricePerDay={product.rentalPricePerDay}
                    sizes={product.sizes}
                  />
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Sign in to reserve dates and book a fitting for this
                      dress.
                    </p>
                    <Link
                      href={`/login?callbackUrl=${callbackUrl}`}
                      className="block w-full rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                    >
                      Sign in to book
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Below the fold: Reviews only ── */}
        <div className="mt-8 rounded-3xl border border-border bg-card p-5 sm:p-6">
          <h3 className="font-heading mb-4 text-base font-medium text-foreground">
            Reviews ({reviews.length})
          </h3>
          <ReviewList reviews={reviews} />
          {isCustomer && (
            <div className="mt-6 border-t border-border pt-6">
              <ReviewForm productId={product.id} />
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}