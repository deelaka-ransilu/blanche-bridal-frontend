import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

type Role = "ADMIN" | "EMPLOYEE" | "CUSTOMER";

/**
 * Server-side layout guard. Redirects to /login if there's no session or
 * the session's role doesn't match. Returns the session so callers that
 * need it (e.g. MyLayout's firstName) don't have to fetch it twice.
 */
export async function requireRole(role: Role) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== role) {
    redirect("/login");
  }
  return session;
}