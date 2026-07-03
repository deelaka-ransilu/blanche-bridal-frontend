import Link from "next/link";
import { dummyProducts } from "@/lib/dummy-data/products";

export default function ProductsPage() {
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

      <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
        <h1 className="font-heading mb-8 text-2xl font-medium text-foreground">
          Our collection
        </h1>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {dummyProducts.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="rounded-xl border border-border bg-card p-4 transition-colors hover:bg-primary/5"
            >
              <div className="mb-3 flex h-48 items-center justify-center rounded-lg bg-primary/8">
                <span className="text-xs text-muted-foreground">Image</span>
              </div>
              <p className="mb-1 text-xs text-muted-foreground">{product.category}</p>
              <p className="mb-1 font-medium text-foreground">{product.name}</p>
              <p className="text-sm text-muted-foreground">{product.price}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}