import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <p className="font-heading text-lg font-medium text-foreground">Blanche Bridal</p>
        <Link
          href="/login"
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          Login
        </Link>
      </nav>

      <main className="mx-auto flex max-w-3xl flex-col items-center px-6 pb-24 pt-20 text-center sm:pt-28">
        <h1 className="font-heading text-4xl font-medium leading-tight text-foreground sm:text-5xl">
          Custom bridal gowns,
          <br />
          made for you
        </h1>
        <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
          Every gown is designed and made to order — fitted to your measurements,
          your style, your day.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/products"
            className="flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Browse gowns
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/login"
            className="flex items-center justify-center rounded-lg border border-border px-6 py-3 text-sm font-medium text-foreground hover:bg-card"
          >
            Login
          </Link>
        </div>
      </main>
    </div>
  );
}