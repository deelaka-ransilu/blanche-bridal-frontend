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

      {/* Mobile: horizontal snap-scroll strip. Desktop: 3-col grid. */}
      <div
        className="
          -mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2
          sm:mx-0 sm:grid sm:snap-none sm:grid-cols-3 sm:overflow-visible sm:px-0 sm:pb-0
        "
      >
        {images.map((item) => (
          <div
            key={item.id}
            className="
              relative h-72 w-[70vw] shrink-0 snap-start overflow-hidden rounded-2xl bg-muted
              sm:h-80 sm:w-auto sm:shrink
            "
          >
            <Image
              src={item.url}
              alt={item.caption || "Gallery image"}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 70vw, 33vw"
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