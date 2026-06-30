import { NextRequest, NextResponse } from "next/server";

/**
 * app/api/proxy-auth/google/route.ts
 * Same Set-Cookie forwarding fix as login/route.ts — see that file's comment
 * for the full explanation. googleAuth() sets the same refreshToken cookie
 * on success, so it has the identical gap.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const backendRes = await fetch(`${API_URL}/api/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await backendRes.json();
  const response = NextResponse.json(data, { status: backendRes.status });

  const setCookies = backendRes.headers.getSetCookie?.() ?? [];
  for (const cookie of setCookies) {
    response.headers.append("set-cookie", cookie);
  }

  return response;
}