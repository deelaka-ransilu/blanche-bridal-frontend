import { NextRequest, NextResponse } from "next/server";
import { getToken, encode } from "next-auth/jwt";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const REFRESH_BUFFER_MS = 60 * 1000;

const PROTECTED_PREFIXES = ["/admin", "/employee", "/my"];

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
}

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
  }
  return Date.now() + 60 * 1000;
}

// Merges freshly-issued cookies (from the backend refresh call, plus the
// re-encoded NextAuth session cookie) into a request's existing Cookie
// header, so the merged result can be handed to NextResponse.next({request})
// -- see the comment further down for why this step is the actual fix.
function mergeCookieHeader(existingCookieHeader: string, updates: Map<string, string>): string {
  const cookieMap = new Map<string, string>();
  for (const part of existingCookieHeader.split(";")) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    cookieMap.set(trimmed.slice(0, eq), trimmed.slice(eq + 1));
  }
  for (const [name, value] of updates) {
    cookieMap.set(name, value);
  }
  return Array.from(cookieMap.entries())
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");
}

export async function proxy(req: NextRequest) {
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

  if (Date.now() < expires - REFRESH_BUFFER_MS) {
    return NextResponse.next();
  }

  const refreshTokenCookie = req.cookies.get("refreshToken")?.value;

  if (!refreshTokenCookie) {
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

  const setCookies = refreshRes.headers.getSetCookie?.() ?? [];

  // ── The actual fix ──────────────────────────────────────────────────────
  // NextResponse.next() + response.cookies.set(...) only rewrites the
  // cookie the BROWSER holds for its NEXT request -- it does not
  // retroactively change the request that's being processed right now.
  // That's exactly why a Server Component rendered later in this same
  // request cycle (e.g. lib/api/orders.ts's getOrderById, called from
  // /my/orders/[id]/page.tsx) was still reading the stale token via
  // getServerSession(), even though the refresh above had already
  // succeeded a few lines earlier. Forwarding the updated cookies into the
  // REQUEST headers (not just the response) makes the fresh session
  // visible to next/headers cookies() / getServerSession() for the rest of
  // this same request -- so downstream Server Components never see a
  // stale token in the first place, and no page-level refresh logic is
  // needed on top of this (see STATUS.md: the previously-documented
  // "Server Component pages don't auto-refresh" gap is resolved by this
  // change alone, lib/api/orders.ts and lib/api/production.ts need no
  // changes).
  const cookieUpdates = new Map<string, string>();
  cookieUpdates.set(cookieName, newSessionJwt);
  for (const cookie of setCookies) {
    const [nameValue] = cookie.split(";");
    const [name, value] = nameValue.split("=");
    if (name && value) {
      cookieUpdates.set(name.trim(), decodeURIComponent(value.trim()));
    }
  }

  const mergedCookieHeader = mergeCookieHeader(req.headers.get("cookie") ?? "", cookieUpdates);
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("cookie", mergedCookieHeader);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // Still also set these on the response, so the BROWSER picks up the
  // refreshed cookies for its next navigation too -- the request-header
  // forwarding above only covers the current request/response cycle.
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