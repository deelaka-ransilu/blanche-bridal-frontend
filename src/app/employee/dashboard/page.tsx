import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function EmployeeDashboard() {
  const session = await getServerSession(authOptions);
  const firstName = session?.user?.name?.split(" ")[0] ?? "there";

  return (
    <div>
      <h1 className="font-heading text-xl font-medium text-foreground">
        Hi, {firstName}
      </h1>
      <p className="text-muted-foreground">
        Logged in as {session?.user?.email} — role: {session?.user?.role}
      </p>
    </div>
  );
}