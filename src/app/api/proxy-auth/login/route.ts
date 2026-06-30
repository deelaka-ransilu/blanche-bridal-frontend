import { NextRequest, NextResponse } from "next/server";

/**
 * app/api/proxy-auth/login/route.ts
 *
 * Why this exists: NextAuth's authorize() callback runs server-side and calls
 * Spring Boot via a plain server-to-server fetch(). That fetch's response
 * carries a Set-Cookie header (the httpOnly refreshToken), but authorize()
 * has no access to the actual outgoing Response object NextAuth sends back to
 * the browser — so that Set-Cookie header was silently being dropped (this
 * was confirmed via DevTools: refreshToken never appeared in the cookie jar,
 * even though login otherwise worked).
 *
 * This route is a real Next.js Route Handler, which DOES have full control
 * over its Response object. authorize() calls this route (same-origin, not
 * Spring Boot directly) so the cookie can be forwarded correctly.
 *
 * Lives outside app/api/auth/[...nextauth]/ deliberately — that path is a
 * catch-all owned by NextAuth itself and would swallow this route otherwise.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const backendRes = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await backendRes.json();
  const response = NextResponse.json(data, { status: backendRes.status });

  // Forward every Set-Cookie header from Spring Boot's response onto ours.
  // Use getSetCookie() (Node 18+ / modern fetch) rather than headers.get(),
  // since get("set-cookie") only returns the FIRST header if there are
  // multiple — getSetCookie() returns all of them as a proper array.
  const setCookies = backendRes.headers.getSetCookie?.() ?? [];
  for (const cookie of setCookies) {
    response.headers.append("set-cookie", cookie);
  }

  return response;
}