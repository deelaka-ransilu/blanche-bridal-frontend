import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { dummyProducts } from "@/lib/dummy-data/products";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = dummyProducts.find((p) => p.id === id);

  if (!product) notFound();

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
          <div className="flex h-80 items-center justify-center rounded-xl bg-primary/8">
            <span className="text-sm text-muted-foreground">Image</span>
          </div>

          <div>
            <p className="mb-1 text-xs text-muted-foreground">{product.category}</p>
            <h1 className="font-heading mb-2 text-2xl font-medium text-foreground">
              {product.name}
            </h1>
            <p className="mb-4 text-lg text-foreground">{product.price}</p>
            <p className="mb-6 text-sm text-muted-foreground">{product.description}</p>

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