import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Paths that need a valid backend session behind them. Keep this narrow —
// static assets, /login, /api/auth/* etc. should never hit this.
const PROTECTED_PREFIXES = ["/admin", "/employee", "/my"];

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Keep route protection here, but do not refresh in middleware: jwt() owns
  // refresh/rotation now so we do not race the backend with two refresh calls
  // using the same old token.
  if (!isProtected(pathname)) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/employee/:path*", "/my/:path*"],
};