import Link from "next/link";
import Image from "next/image";
import { PublicNav } from "@/components/public-nav";
import { SiteFooter } from "@/components/site-footer";
import { SmoothScroll } from "@/components/smooth-scroll";
import { getProducts } from "@/lib/api/products";

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function RentPage() {
  const result = await getProducts({ type: "DRESS" });
  const dresses = result.success
    ? result.data.filter((p) => p.rentalPrice != null)
    : [];

  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      <SmoothScroll>
        <main className="mx-auto max-w-6xl px-6 pb-24 pt-24 sm:pt-28">
          {/* ---------- Header ---------- */}
          <div className="mb-10 text-center sm:mb-14">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              For your big day
            </p>
            <h1 className="font-heading mt-2 text-3xl font-medium text-foreground sm:text-4xl lg:text-5xl">
              Rent a gown
            </h1>
            <p className="mx-auto mt-2 max-w-xl text-sm italic leading-relaxed text-muted-foreground sm:text-base">
              Stunning gowns for every occasion, without the commitment of
              buying. Pick a dress, book a fitting — we handle the rest.
            </p>
          </div>

          {!result.success && (
            <p className="mb-6 text-center text-sm text-destructive">
              {result.message}
            </p>
          )}

          {/* ---------- Grid ---------- */}
          {dresses.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {dresses.map((dress) => (
                <Link
                  key={dress.id}
                  href={`/rent/${dress.slug}`}
                  className="group overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-primary/8">
                    {dress.firstImageUrl ? (
                      <Image
                        src={dress.firstImageUrl}
                        alt={dress.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="text-xs text-muted-foreground">
                          Image coming soon
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-primary">
                      {dress.category?.name ?? "Dress"}
                    </p>
                    <p className="font-heading mt-1 text-base font-medium text-foreground">
                      {dress.name}
                    </p>
                    {dress.rentalPrice != null && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatPrice(dress.rentalPrice)} / rental
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-border py-20 text-center">
              <p className="text-sm text-muted-foreground">
                No rental dresses available right now — check back soon.
              </p>
            </div>
          )}
        </main>

        <SiteFooter />
      </SmoothScroll>
    </div>
  );
}