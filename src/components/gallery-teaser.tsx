import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

// 3 of the 5 GALLERY_ITEMS from /gallery, used as a teaser strip on
// /custom-design. Kept as its own small local array rather than importing
// GALLERY_ITEMS from /gallery/page.tsx, since page-level arrays aren't
// meant to be shared exports -- if the full 5 ever move to a shared
// constants file, this can import from there instead.
const TEASER_ITEMS = [
  {
    src: "https://res.cloudinary.com/dexuqaeuf/image/upload/v1777624460/south-indian-bride_w2m8ym.png",
    caption: "The South Indian bride",
  },
  {
    src: "https://res.cloudinary.com/dexuqaeuf/image/upload/v1777624459/kandyan-bride_ngl3nq.png",
    caption: "The Kandyan bride",
  },
  {
    src: "https://res.cloudinary.com/dexuqaeuf/image/upload/v1777624461/western-bride_xxvg2i.png",
    caption: "The Western bride",
  },
];

export function GalleryTeaser() {
  return (
    <section>
      <div className="mb-6 flex items-end justify-between gap-4">
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
          className="group hidden shrink-0 items-center gap-1 text-sm font-medium text-foreground transition-colors hover:text-primary sm:flex"
        >
          View full gallery
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {TEASER_ITEMS.map((item) => (
          <div
            key={item.caption}
            className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-card"
          >
            <Image
              src={item.src}
              alt={item.caption}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 33vw, 25vw"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
              <span className="text-xs font-medium uppercase tracking-wide text-white">
                {item.caption}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile-only link, since the desktop one sits in the header row */}
      <Link
        href="/gallery"
        className="mt-4 flex items-center justify-center gap-1 text-sm font-medium text-foreground transition-colors hover:text-primary sm:hidden"
      >
        View full gallery
        <ArrowUpRight className="h-4 w-4" />
      </Link>
    </section>
  );
}