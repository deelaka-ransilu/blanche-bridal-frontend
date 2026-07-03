import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MyHeader } from "@/components/my/my-header";
import { BottomNav } from "@/components/bottom-nav";

export default async function MyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "CUSTOMER") {
    redirect("/login");
  }

  const firstName = session.user?.name?.split(" ")[0] ?? "there";

  return (
    <div className="min-h-screen bg-background pb-28 pt-5">
      <div className="mx-auto max-w-md px-5">
        <MyHeader firstName={firstName} />
        {children}
      </div>
      <BottomNav />
    </div>
  );
}