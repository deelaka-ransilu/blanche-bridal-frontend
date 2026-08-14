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

  // Same role/route matching as the credentials login flow -- only block
  // callbackUrl when it points into another role's staff area. Any
  // non-staff route (public pages, /my/..., etc.) is fair game for
  // whichever role just logged in.
  if (callbackUrl) {
    const isAdminRoute = callbackUrl.startsWith("/admin");
    const isEmployeeRoute = callbackUrl.startsWith("/employee");
    const isStaffRoute = isAdminRoute || isEmployeeRoute;

    const allowed =
      (role === "ADMIN" && isAdminRoute) ||
      (role === "EMPLOYEE" && isEmployeeRoute) ||
      (role !== "ADMIN" && role !== "EMPLOYEE" && !isStaffRoute);

    if (allowed) {
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