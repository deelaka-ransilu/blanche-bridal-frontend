import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const role = token?.role as string | undefined;

  // Not logged in at all — protected areas require a session.
  if (!token) {
    if (
      pathname.startsWith("/my") ||
      pathname.startsWith("/admin") ||
      pathname.startsWith("/employee")
    ) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.next();
  }

  // Logged in, but wrong role for the area they're trying to reach.
  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/my/dashboard", req.url));
  }

  if (pathname.startsWith("/employee") && role !== "EMPLOYEE") {
    return NextResponse.redirect(new URL("/my/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/my/:path*", "/admin/:path*", "/employee/:path*"],
};