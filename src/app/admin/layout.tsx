import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Redirect if not logged in or not admin
  if (!session || session.user?.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="flex min-h-svh bg-background">
      <div className="flex-1 lg:ml-64">
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}