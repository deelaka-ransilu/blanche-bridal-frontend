import Link from "next/link";
import { getProducts } from "@/lib/api/products";
import { getAllCategories } from "@/lib/api/categories";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;

  const [productsResult, categoriesResult] = await Promise.all([
    getProducts({ categoryId: category }),
    getAllCategories(),
  ]);

  const products = productsResult.success ? productsResult.data : [];
  const categories = categoriesResult.success ? categoriesResult.data : [];

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
        <h1 className="font-heading mb-6 text-2xl font-medium text-foreground">
          Our collection
        </h1>

        {categories.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            <Link
              href="/products"
              className={`rounded-full border px-4 py-1.5 text-xs font-medium ${
                !category
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-primary/5"
              }`}
            >
              All
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.id}`}
                className={`rounded-full border px-4 py-1.5 text-xs font-medium ${
                  category === cat.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:bg-primary/5"
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        )}

        {!productsResult.success && (
          <p className="text-sm text-destructive">{productsResult.message}</p>
        )}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="rounded-xl border border-border bg-card p-4 transition-colors hover:bg-primary/5"
            >
              <div className="mb-3 flex h-48 items-center justify-center overflow-hidden rounded-lg bg-primary/8">
                {product.firstImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.firstImageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-xs text-muted-foreground">Image</span>
                )}
              </div>
              <p className="mb-1 text-xs text-muted-foreground">
                {product.category?.name ?? "Uncategorized"}
              </p>
              <p className="mb-1 font-medium text-foreground">{product.name}</p>
              <p className="text-sm text-muted-foreground">
                {product.purchasePrice != null
                  ? `Rs ${product.purchasePrice.toLocaleString("en-LK")}`
                  : product.rentalPrice != null
                    ? `Rs ${product.rentalPrice.toLocaleString("en-LK")} (rental)`
                    : "Price on inquiry"}
              </p>
            </Link>
          ))}
        </div>

        {products.length === 0 && productsResult.success && (
          <p className="text-sm text-muted-foreground">No products found.</p>
        )}
      </main>
    </div>
  );
}