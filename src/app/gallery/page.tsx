import { PublicNav } from "@/components/public-nav";
import Image from "next/image";
import { BookFittingButton } from "@/components/book-fitting-button";

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

      <main className="mx-auto max-w-6xl px-6 pb-16 pt-24 sm:pt-28">
        <div className="mb-10 text-center sm:mb-14">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Lookbook
          </p>
          <h1 className="font-heading mt-2 text-3xl font-medium text-foreground sm:text-4xl lg:text-5xl">
            Gallery
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-sm italic leading-relaxed text-muted-foreground sm:text-base">
            A closer look at the styles, textures, and traditions we bring
            to every gown.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
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
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                <span className="text-xs font-medium uppercase tracking-wide text-white">
                  {item.caption}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex justify-center sm:mt-14">
          <BookFittingButton className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90" />
        </div>
      </main>
    </div>
  );
}