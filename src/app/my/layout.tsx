import { requireRole } from "@/lib/auth-guard";
import { MyNav } from "@/components/my/my-nav";
import { BottomNav } from "@/components/bottom-nav";


export default async function MyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole("CUSTOMER");
  const firstName = session.user?.name?.split(" ")[0] ?? "there";

  return (
    <div className="min-h-screen bg-background pb-28 pt-20">
      <MyNav firstName={firstName} />
      <div className="mx-auto max-w-md px-5">
        <p className="font-heading mb-4 text-lg font-medium text-foreground">
          Hi, {firstName}
        </p>
        {children}
      </div>
      <BottomNav />
    </div>
  );
}