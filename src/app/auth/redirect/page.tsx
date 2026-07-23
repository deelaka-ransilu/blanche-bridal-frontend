import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function AuthRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const { callbackUrl } = await searchParams;
  const role = session.user.role;

  // Same role/route matching as the credentials login flow -- only honor
  // callbackUrl when it actually belongs to this role's area.
  if (callbackUrl) {
    const isCustomerRoute = callbackUrl.startsWith("/my");
    const isAdminRoute = callbackUrl.startsWith("/admin");
    const isEmployeeRoute = callbackUrl.startsWith("/employee");

    if (
      (role === "ADMIN" && isAdminRoute) ||
      (role === "EMPLOYEE" && isEmployeeRoute) ||
      (role !== "ADMIN" && role !== "EMPLOYEE" && isCustomerRoute)
    ) {
      redirect(callbackUrl);
    }
  }

  switch (role) {
    case "ADMIN":
      redirect("/admin/dashboard");
    case "EMPLOYEE":
      redirect("/employee/orders");
    default:
      redirect("/my/dashboard");
  }
}