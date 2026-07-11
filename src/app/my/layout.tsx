import { requireRole } from "@/lib/auth-guard";
import { PublicNav } from "@/components/public-nav";
import { BottomNav } from "@/components/bottom-nav";

export default async function MyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole("CUSTOMER");
  const firstName = session.user?.name?.split(" ")[0] ?? "there";

  return (
    <div className="min-h-screen bg-background pb-28 pt-24 sm:pt-28">
      <PublicNav />
      <div className="mx-auto max-w-md px-5 sm:max-w-2xl lg:max-w-4xl">
        <p className="font-heading mb-5 mt-2 text-lg font-medium text-foreground">
          Hi, {firstName}
        </p>
        {children}
      </div>
      <BottomNav />
    </div>
  );
}