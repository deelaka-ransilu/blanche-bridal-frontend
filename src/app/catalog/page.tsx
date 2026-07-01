import Link from "next/link";
import { listProducts } from "@/lib/api/products";

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const result = await listProducts({
    search: params.search,
    type: params.type,
    page: params.page ? Number(params.page) : 0,
  });

  if ("error" in result) {
    return <div className="p-8 text-sm text-red-600">{result.error}</div>;
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-semibold">Catalog</h1>

      {result.data.length === 0 ? (
        <p className="text-sm text-muted-foreground">No products found.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {result.data.map((p) => (
            <Link
              key={p.id}
              href={`/catalog/${p.slug}`}
              className="block border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="aspect-[3/4] bg-muted">
                {p.firstImageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.firstImageUrl}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="p-3 space-y-1">
                <p className="font-medium text-sm">{p.name}</p>
                {p.category && (
                  <p className="text-xs text-muted-foreground">
                    {p.category.name}
                  </p>
                )}
                <p className="text-sm">
                  {p.rentalPrice != null && `Rent LKR ${p.rentalPrice}`}
                  {p.rentalPrice != null && p.purchasePrice != null && " · "}
                  {p.purchasePrice != null && `Buy LKR ${p.purchasePrice}`}
                </p>
                {!p.isAvailable && (
                  <p className="text-xs text-red-600">Unavailable</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="flex gap-2 text-sm">
        {Array.from({ length: result.pagination.totalPages }).map((_, i) => (
          <Link
            key={i}
            href={`/catalog?page=${i}`}
            className={
              i === result.pagination.page
                ? "font-semibold underline"
                : "text-muted-foreground"
            }
          >
            {i + 1}
          </Link>
        ))}
      </div>
    </div>
  );
}