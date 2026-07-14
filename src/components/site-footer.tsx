import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="font-heading text-lg font-bold text-foreground">
              Blanche Bridal
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Gowns, fittings, and rentals — crafted for every tradition.
            </p>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <Link href="/products" className="transition-colors hover:text-foreground">
              Products
            </Link>
            <Link href="/rent" className="transition-colors hover:text-foreground">
              Rent
            </Link>
            <Link href="/custom-design" className="transition-colors hover:text-foreground">
              Custom Design & Gallery
            </Link>
            <Link href="/contact" className="transition-colors hover:text-foreground">
              Contact
            </Link>
          </nav>
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Blanche Bridal. All rights reserved.
        </p>
      </div>
    </footer>
  );
}