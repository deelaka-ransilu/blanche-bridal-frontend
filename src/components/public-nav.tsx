import Link from "next/link";

export function PublicNav() {
  return (
    <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
      <Link href="/" className="font-heading text-lg font-medium text-foreground">
        Blanche Bridal
      </Link>
      <Link
        href="/login"
        className="text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        Login
      </Link>
    </nav>
  );
}