import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="space-y-2">
        <h1 className="text-4xl font-semibold tracking-tight">Blanche Bridal</h1>
        <p className="text-muted-foreground max-w-md">
          Bridal boutique management — appointments, custom orders, and rentals
          in one place.
        </p>
      </div>

      <div className="flex gap-3">
        <Button asChild>
          <Link href="/login">Sign in</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/register">Create account</Link>
        </Button>
      </div>
    </div>
  );
}