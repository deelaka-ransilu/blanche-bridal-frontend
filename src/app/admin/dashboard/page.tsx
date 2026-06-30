import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Logged in as {session?.user?.email} — role: {session?.user?.role}
        </p>
      </div>
    </div>
  );
}