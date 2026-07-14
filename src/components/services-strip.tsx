import Link from "next/link";
import Image from "next/image";

interface ShowcaseTile {
  eyebrow: string;
  title: string;
  subtitle?: string;
  href: string;
  src: string;
}

const LARGE_TILE: ShowcaseTile = {
  eyebrow: "Buy",
  title: "Bridal gowns",
  subtitle: "Own it forever",
  href: "/products?type=DRESS",
  src: "https://res.cloudinary.com/dexuqaeuf/image/upload/v1784005061/Bridal_Gowns_large_tile_o8d9vz.png",
};

const SIDE_TILES: ShowcaseTile[] = [
  {
    eyebrow: "Rent",
    title: "For your event",
    href: "#rentals",
    src: "https://res.cloudinary.com/dexuqaeuf/image/upload/v1784005060/Rentals_fxcytt.png",
  },
  {
    eyebrow: "Create",
    title: "Custom design",
    href: "/my/custom-design/new",
    src: "https://res.cloudinary.com/dexuqaeuf/image/upload/v1784005061/Custom_Design_jumy1z.png",
  },
];

function ShowcaseCard({
  tile,
  sizes,
  titleClassName,
}: {
  tile: ShowcaseTile;
  sizes: string;
  titleClassName: string;
}) {
  return (
    <Link
      href={tile.href}
      className="group relative block h-full w-full overflow-hidden rounded-2xl bg-[#3a3733]"
    >
      <Image
        src={tile.src}
        alt={tile.title}
        fill
        sizes={sizes}
        className="object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
      <div className="absolute left-4 top-4 sm:left-5 sm:top-5">
        <span className="rounded-full bg-primary px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-primary-foreground">
          {tile.eyebrow}
        </span>
      </div>
      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
        <h3 className={`font-heading font-bold text-white ${titleClassName}`}>
          {tile.title}
        </h3>
        {tile.subtitle && (
          <p className="mt-1 text-sm text-[#d8d5cf]">{tile.subtitle}</p>
        )}
      </div>
    </Link>
  );
}

export function ServicesShowcase() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-7">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          What we offer
        </p>
        <h2 className="font-heading mt-2 text-2xl font-bold text-foreground sm:text-3xl">
          Everything for your big day
        </h2>
      </div>

      <div className="flex flex-col gap-4 lg:h-[22.5rem] lg:flex-row">
        <div className="h-72 sm:h-80 lg:h-full lg:flex-[1.3]">
          <ShowcaseCard
            tile={LARGE_TILE}
            sizes="(max-width: 1024px) 100vw, 55vw"
            titleClassName="text-2xl sm:text-3xl"
          />
        </div>

        <div className="flex flex-col gap-4 lg:flex-1">
          {SIDE_TILES.map((tile) => (
            <div key={tile.title} className="h-40 sm:h-48 lg:h-auto lg:flex-1">
              <ShowcaseCard
                tile={tile}
                sizes="(max-width: 1024px) 100vw, 27vw"
                titleClassName="text-lg sm:text-xl"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}