import Link from "next/link";
import { Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Search className="h-8 w-8 text-primary" />
        </div>

        <p className="mb-1 text-sm font-medium tracking-wide text-muted-foreground">
          404
        </p>
        <h1 className="font-heading mb-2 text-2xl font-medium text-foreground">
          Page not found
        </h1>
        <p className="mb-8 text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or may have been
          moved.
        </p>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Back to home
          </Link>
          <Link
            href="/products"
            className="rounded-xl border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-card"
          >
            Browse products
          </Link>
        </div>
      </div>
    </div>
  );
}