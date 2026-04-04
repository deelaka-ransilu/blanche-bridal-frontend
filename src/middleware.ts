import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  // If logged in and trying to access login/register → redirect to dashboard
  if (token && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(
      new URL(getDashboard(token.role as string), request.url),
    );
  }

  // If not logged in and trying to access protected routes → redirect to login
  if (!token && isProtected(pathname)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Role-based protection
  if (token) {
    const role = token.role as string;

    if (pathname.startsWith("/superadmin") && role !== "SUPERADMIN") {
      return NextResponse.redirect(new URL(getDashboard(role), request.url));
    }
    if (
      pathname.startsWith("/admin") &&
      !["ADMIN", "SUPERADMIN"].includes(role)
    ) {
      return NextResponse.redirect(new URL(getDashboard(role), request.url));
    }
    if (
      pathname.startsWith("/employee") &&
      !["EMPLOYEE", "ADMIN", "SUPERADMIN"].includes(role)
    ) {
      return NextResponse.redirect(new URL(getDashboard(role), request.url));
    }
  }

  return NextResponse.next();
}

function isProtected(pathname: string): boolean {
  return (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/employee") ||
    pathname.startsWith("/superadmin")
  );
}

function getDashboard(role: string): string {
  switch (role) {
    case "SUPERADMIN":
      return "/superadmin/dashboard";
    case "ADMIN":
      return "/admin/dashboard";
    case "EMPLOYEE":
      return "/employee/dashboard";
    default:
      return "/dashboard";
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
