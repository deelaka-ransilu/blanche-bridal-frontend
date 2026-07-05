import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getProductBySlug } from "@/lib/api/products";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getProductBySlug(slug);

  if (!result.success) notFound();
  const product = result.data;

  const displayPrice =
    product.purchasePrice != null
      ? `Rs ${product.purchasePrice.toLocaleString("en-LK")}`
      : product.rentalPrice != null
        ? `Rs ${product.rentalPrice.toLocaleString("en-LK")} (rental)`
        : "Price on inquiry";

  return (
    <div className="min-h-screen bg-background">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="font-heading text-lg font-medium text-foreground">
          Blanche Bridal
        </Link>
        <Link
          href="/login"
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          Login
        </Link>
      </nav>

      <main className="mx-auto max-w-4xl px-6 pb-24 pt-4">
        <Link
          href="/products"
          className="mb-6 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> Collection
        </Link>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          <div className="flex h-80 items-center justify-center overflow-hidden rounded-xl bg-primary/8">
            {product.images.length > 0 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.images[0].url}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-sm text-muted-foreground">Image</span>
            )}
          </div>

          <div>
            <p className="mb-1 text-xs text-muted-foreground">
              {product.category?.name ?? "Uncategorized"}
            </p>
            <h1 className="font-heading mb-2 text-2xl font-medium text-foreground">
              {product.name}
            </h1>
            <p className="mb-4 text-lg text-foreground">{displayPrice}</p>
            {product.description && (
              <p className="mb-4 text-sm text-muted-foreground">{product.description}</p>
            )}
            {product.sizes.length > 0 && (
              <p className="mb-6 text-xs text-muted-foreground">
                Sizes: {product.sizes.join(", ")}
              </p>
            )}

            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Book a consultation
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}