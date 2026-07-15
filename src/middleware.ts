import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const REFRESH_BUFFER_MS = 60 * 1000;

// Paths that need a valid backend session behind them. Keep this narrow —
// static assets, /login, /api/auth/* etc. should never hit this.
const PROTECTED_PREFIXES = ["/admin", "/employee", "/my"];

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!isProtected(pathname)) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    console.log(`[MW] ${pathname} — no session token, skipping`);
    return NextResponse.next();
  }

  const expires = (token.accessTokenExpires as number | undefined) ?? 0;
  const isStale = Date.now() >= expires - REFRESH_BUFFER_MS;

  console.log(
    `[MW] ${pathname} — expires in ${Math.round((expires - Date.now()) / 1000)}s, stale=${isStale}`
  );

  if (!isStale) {
    return NextResponse.next();
  }

  // Proactively refresh here — middleware CAN write cookies, unlike
  // Server Components. This is what actually closes the gap: by the time
  // AdminLayout/getServerSession() runs, the cookie is already fresh.
  const cookieHeader = req.headers.get("cookie") ?? "";

  console.log(`[MW] ${pathname} — refreshing backend token...`);

  try {
    const res = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { Cookie: cookieHeader },
    });

    console.log(`[MW] ${pathname} — refresh response ok=${res.ok} status=${res.status}`);

    if (!res.ok) {
      // Refresh token itself is dead — let the request through as-is.
      // Downstream getServerSession()/requireRole() will bounce to /login
      // via the normal expired-session path.
      return NextResponse.next();
    }

    const body = await res.json();
    if (!body?.success || !body?.data?.token) {
      console.log(`[MW] ${pathname} — refresh body missing token, treating as failed`);
      return NextResponse.next();
    }

    const response = NextResponse.next();

    // Forward rotated refreshToken cookie from backend to browser
    const setCookies = res.headers.getSetCookie?.() ?? [];
    console.log(`[MW] ${pathname} — forwarding ${setCookies.length} set-cookie header(s)`);
    for (const cookie of setCookies) {
      response.headers.append("set-cookie", cookie);
    }

    // NOTE: we can't rewrite the NextAuth session JWT cookie itself here
    // with the new backendToken/expiry — that still requires the jwt()
    // callback to pick it up. What this DOES fix: the refreshToken cookie
    // in the browser is now valid and rotated, so when the jwt() callback
    // later calls its own refresh, it succeeds instead of sending a
    // stale/deleted token. See auth.ts changes — jwt() callback still does
    // the "is my session token stale, ask backend for a new access token"
    // check, but no longer races against a rotted refreshToken cookie.
    return response;
  } catch (err) {
    console.log(`[MW] ${pathname} — refresh threw:`, err);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/admin/:path*", "/employee/:path*", "/my/:path*"],
};