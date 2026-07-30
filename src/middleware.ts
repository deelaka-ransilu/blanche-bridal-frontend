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
  const response = NextResponse.next();

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