import { NextRequest, NextResponse } from "next/server";
import { getToken, encode } from "next-auth/jwt";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const REFRESH_BUFFER_MS = 60 * 1000;

// Paths that need a valid backend session behind them. Keep this narrow —
// static assets, /login, /api/auth/* etc. should never hit this.
const PROTECTED_PREFIXES = ["/admin", "/employee", "/my"];

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
}

// Edge-runtime-safe JWT payload decode — Buffer isn't available here,
// unlike auth.ts's decodeJwtPayload which runs in the Node runtime.
function decodeJwtPayload(token: string): Record<string, unknown> {
  const payload = token.split(".")[1];
  const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  return JSON.parse(atob(padded));
}

function getTokenExpiry(token: string): number {
  try {
    const payload = decodeJwtPayload(token);
    const exp = payload.exp as number | undefined;
    if (typeof exp === "number") return exp * 1000;
  } catch {
    // fall through
  }
  return Date.now() + 60 * 1000;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!isProtected(pathname)) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const expires = (token.accessTokenExpires as number | undefined) ?? 0;

  // Access token still fresh — nothing to do.
  if (Date.now() < expires - REFRESH_BUFFER_MS) {
    return NextResponse.next();
  }

  // Access token is expired or about to be — middleware is the one place
  // guaranteed a real NextResponse we can attach Set-Cookie to, so this is
  // where refresh + cookie rotation actually has to happen. jwt()'s own
  // refresh path in auth.ts can't reliably write cookies when triggered
  // from a Server Component render — see auth.ts's forwardSetCookies
  // comment. That gap is what caused the repeated "Invalid refresh token"
  // loop: the backend rotated the refresh token, but the new one never
  // reached the browser, so every later request kept sending the old,
  // now-deleted one.
  const refreshTokenCookie = req.cookies.get("refreshToken")?.value;

  if (!refreshTokenCookie) {
    // No refresh token to work with — treat like an expired session.
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  let refreshRes: Response;
  try {
    refreshRes = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { Cookie: `refreshToken=${refreshTokenCookie}` },
    });
  } catch {
    // Network failure — let the request through as-is rather than hard
    // failing the whole page; the client-side 401 path can still catch it.
    return NextResponse.next();
  }

  if (!refreshRes.ok) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    const redirect = NextResponse.redirect(loginUrl);
    redirect.cookies.delete("refreshToken");
    return redirect;
  }

  let body: { success?: boolean; data?: { token?: string; refreshToken?: string } };
  try {
    body = await refreshRes.json();
  } catch {
    return NextResponse.next();
  }

  if (!body?.success || !body?.data?.token) {
    return NextResponse.next();
  }

  const newAccessToken = body.data.token;
  const response = NextResponse.next();

  // Forward the backend's rotated refresh token straight from its
  // Set-Cookie header — preserves whatever Max-Age/attributes the backend
  // set, same as auth.ts's forwardSetCookies, but this time we're
  // guaranteed to be in a context that can actually write it.
  const setCookies = refreshRes.headers.getSetCookie?.() ?? [];
  for (const cookie of setCookies) {
    const [nameValue] = cookie.split(";");
    const [name, value] = nameValue.split("=");
    if (name && value) {
      response.cookies.set(name.trim(), decodeURIComponent(value.trim()), {
        httpOnly: true,
        path: "/",
        sameSite: "lax",
      });
    }
  }

  // Re-encode the NextAuth session cookie itself with the new backendToken
  // — without this, getToken() on the NEXT request still decrypts to the
  // old (now backend-rejected) access token, even though the refresh
  // cookie is fresh.
  const updatedToken = {
    ...token,
    backendToken: newAccessToken,
    accessTokenExpires: getTokenExpiry(newAccessToken),
  };

  const newSessionJwt = await encode({
    token: updatedToken,
    secret: process.env.NEXTAUTH_SECRET!,
  });

  const cookieName =
    process.env.NODE_ENV === "production"
      ? "__Secure-next-auth.session-token"
      : "next-auth.session-token";

  response.cookies.set(cookieName, newSessionJwt, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/employee/:path*", "/my/:path*"],
};