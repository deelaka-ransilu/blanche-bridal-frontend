import { getProductBySlug } from "@/lib/api/products";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const res = await getProductBySlug(slug);

  if (!res.success || !res.data) {
    return (
      <div className="p-8 text-sm text-red-600">
        {res.success ? "Product not found" : res.message}
      </div>
    );
  }

  const p = res.data;

  return (
    <div className="p-8 grid md:grid-cols-2 gap-8 max-w-4xl">
      <div className="space-y-3">
        {p.images.length > 0 ? (
          p.images
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((img) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={img.id}
                src={img.url}
                alt={p.name}
                className="w-full rounded-lg"
              />
            ))
        ) : (
          <div className="aspect-[3/4] bg-muted rounded-lg" />
        )}
      </div>

      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">{p.name}</h1>
        {p.category && (
          <p className="text-sm text-muted-foreground">{p.category.name}</p>
        )}
        <p className="text-lg">
          {p.rentalPrice != null && `Rent LKR ${p.rentalPrice}`}
          {p.rentalPrice != null && p.purchasePrice != null && " · "}
          {p.purchasePrice != null && `Buy LKR ${p.purchasePrice}`}
        </p>
        {p.description && <p className="text-sm">{p.description}</p>}
        {p.sizes.length > 0 && (
          <p className="text-sm">Sizes: {p.sizes.join(", ")}</p>
        )}
        <p className="text-sm">
          {p.isAvailable ? `In stock (${p.stock})` : "Currently unavailable"}
        </p>
        {p.averageRating != null && (
          <p className="text-sm">Rating: {p.averageRating.toFixed(1)} / 5</p>
        )}
      </div>
    </div>
  );
}