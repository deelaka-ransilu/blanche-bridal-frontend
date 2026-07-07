import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getProductBySlug } from "@/lib/api/products";
import { PublicNav } from "@/components/public-nav";
import { RentalBookingForm } from "@/components/rentals/rental-booking-form";

export default async function RentProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getProductBySlug(slug);

  if (!result.success) notFound();
  const product = result.data;

  // Products without a rentalPrice aren't rentable -- mirrors the backend
  // check in RentalServiceImpl.bookRental() ("Product is not available for
  // rental"). Redirect back rather than show a booking form that will
  // always fail server-side.
  if (product.rentalPrice == null) notFound();

  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      <main className="mx-auto max-w-2xl px-6 pb-24 pt-4">
        <Link
          href={`/products/${slug}`}
          className="mb-6 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> Back to {product.name}
        </Link>

        <h1 className="font-heading mb-1 text-2xl font-medium text-foreground">
          Rent: {product.name}
        </h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Deposit: Rs {product.rentalPrice.toLocaleString("en-LK")}
        </p>

        <RentalBookingForm productId={product.id} />
      </main>
    </div>
  );
}