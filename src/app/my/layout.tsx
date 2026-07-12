import { requireRole } from "@/lib/auth-guard";
import { PublicNav } from "@/components/public-nav";
import { BottomNav } from "@/components/bottom-nav";

export default async function MyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("CUSTOMER");

  return (
    <div className="min-h-screen bg-background pb-28 pt-24 sm:pt-28">
      <PublicNav />
      <div className="mx-auto max-w-md px-5 pt-4 sm:max-w-2xl lg:max-w-4xl">
        {children}
      </div>
      <BottomNav />
    </div>
  );
}