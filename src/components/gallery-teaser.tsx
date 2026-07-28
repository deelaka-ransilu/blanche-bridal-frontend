import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getAllGalleryImages } from "@/lib/api/gallery";

export async function GalleryTeaser() {
  const result = await getAllGalleryImages();
  const images = result.success ? result.data.slice(0, 3) : [];

  if (images.length === 0) {
    return null;
  }

  const [featured, ...rest] = images;

  return (
    <div>
      <div className="mb-5 flex items-center justify-between sm:mb-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Inspiration
          </p>
          <h2 className="font-heading mt-1 text-2xl font-medium text-foreground sm:text-3xl">
            A closer look at our gowns
          </h2>
        </div>
        <Link
          href="/gallery"
          className="hidden shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline sm:flex"
        >
          View full gallery
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Collage: one large featured image + up to two smaller stacked beside it.
          No horizontal scroll on any breakpoint — reflows to a 3-col grid on sm+. */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        <div className="relative col-span-1 row-span-2 h-64 overflow-hidden rounded-2xl bg-muted sm:h-80">
          <Image
            src={featured.url}
            alt={featured.caption || "Gallery image"}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          {featured.caption && (
            <span className="absolute bottom-3 left-3 text-xs font-medium uppercase tracking-wide text-white">
              {featured.caption}
            </span>
          )}
        </div>

        <div className="col-span-1 flex flex-col gap-3 sm:col-span-2 sm:grid sm:grid-cols-2 sm:gap-4">
          {rest.map((item) => (
            <div
              key={item.id}
              className="relative h-[calc(50%-0.375rem)] overflow-hidden rounded-2xl bg-muted sm:h-80"
            >
              <Image
                src={item.url}
                alt={item.caption || "Gallery image"}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              {item.caption && (
                <span className="absolute bottom-3 left-3 text-xs font-medium uppercase tracking-wide text-white">
                  {item.caption}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile-only "view full gallery" link since the desktop one is in the header row */}
      <Link
        href="/gallery"
        className="mt-4 flex items-center gap-1 text-sm font-medium text-primary hover:underline sm:hidden"
      >
        View full gallery
        <ArrowUpRight className="h-4 w-4" />
      </Link>
    </div>
  );
}