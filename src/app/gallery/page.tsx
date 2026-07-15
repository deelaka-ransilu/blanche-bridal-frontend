import Image from "next/image";
import Link from "next/link";
import { PublicNav } from "@/components/public-nav";
import { SiteFooter } from "@/components/site-footer";
import { CustomDesignButton } from "@/components/custom-design-button";

// Fixed set of 5 -- hardcoded on the /custom-design page too (not fetched,
// no admin management, no GalleryImage type). Grid is built for this known
// count, not for pagination/filtering.
const GALLERY_ITEMS = [
  {
    src: "https://res.cloudinary.com/dexuqaeuf/image/upload/v1777624460/south-indian-bride_w2m8ym.png",
    caption: "The South Indian bride",
  },
  {
    src: "https://res.cloudinary.com/dexuqaeuf/image/upload/v1777624460/low-country-saree-bride_rcn8w0.png",
    caption: "The low-country bride",
  },
  {
    src: "https://res.cloudinary.com/dexuqaeuf/image/upload/v1777624459/kandyan-bride_ngl3nq.png",
    caption: "The Kandyan bride",
  },
  {
    src: "https://res.cloudinary.com/dexuqaeuf/image/upload/v1777624460/muslim-bride_vgmtaf.png",
    caption: "The Muslim bride",
  },
  {
    src: "https://res.cloudinary.com/dexuqaeuf/image/upload/v1777624461/western-bride_xxvg2i.png",
    caption: "The Western bride",
  },
];

export default function GalleryPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      <main className="mx-auto max-w-6xl px-6 pb-24 pt-24 sm:pt-28">
        {/* ---------- Header ---------- */}
        <div className="mb-10 text-center sm:mb-14">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            The lookbook
          </p>
          <h1 className="font-heading mt-2 text-3xl font-medium text-foreground sm:text-4xl lg:text-5xl">
            Gowns we&apos;ve brought to life
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-sm italic leading-relaxed text-muted-foreground sm:text-base">
            Five silhouettes, five traditions -- a starting point for your
            own custom design.
          </p>
        </div>

        {/* ---------- Gallery grid ---------- */}
        <section>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {GALLERY_ITEMS.map((item) => (
              <div
                key={item.caption}
                className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-card"
              >
                <Image
                  src={item.src}
                  alt={item.caption}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, 33vw"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                  <span className="text-xs font-medium uppercase tracking-wide text-white">
                    {item.caption}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ---------- Closing CTA ---------- */}
        <section className="mt-16 text-center sm:mt-20">
          <h2 className="font-heading text-2xl font-medium text-foreground sm:text-3xl">
            See something you love?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground sm:text-base">
            Every gown here started as a conversation. Let&apos;s start
            yours.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <CustomDesignButton className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90" />
          </div>
          <Link
            href="/custom-design"
            className="mt-3 inline-block text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            See how the process works
          </Link>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}