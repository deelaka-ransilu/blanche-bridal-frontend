/**
 * lib/api/auth.ts
 *
 * PUBLIC auth endpoints only — no token required, safe to import from any
 * client component (login form, register form, forgot/reset-password,
 * verify-email). Imports only from ./client, which has no server-only
 * dependencies.
 *
 * Authenticated functions (profile, admin employee/customer management) live
 * in ./auth-server.ts instead, since those need ./server.ts's next/headers-
 * based refresh logic — importing that from here would make this file
 * unsafe to use in client components too, defeating the point of the split.
 */

import { apiRequest, parseResponse, type ApiResponse } from "./client";

// ── Types ───────────────────────────────────────────────────────────────────
// NOTE: backend never puts refreshToken in the JSON body (it's httpOnly-cookie only,
// per the locked decision) — login/google responses are just { token, role }.
// Server-side fetch (this runs inside authorize(), which executes on the
// server) has no implicit page origin to resolve a relative path against —
// unlike a browser fetch. NEXTAUTH_URL is the standard NextAuth env var for
// "what origin am I running on" and is required to be set in any NextAuth v4
// app anyway, so it's the correct source for this rather than introducing a
// new env var.
const APP_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

export type AuthResponse = {
  token: string;
  role: string;
};

/**
 * login() and googleAuth() do NOT go through apiRequest()/Spring Boot directly.
 * They call same-origin Next.js proxy routes instead (app/api/proxy-auth/*),
 * which forward Spring Boot's Set-Cookie header (the httpOnly refreshToken)
 * onto the actual browser response. A plain server-to-server fetch from
 * authorize() can't do this itself — NextAuth's authorize() callback has no
 * access to the outgoing Response object, so any Set-Cookie header from a
 * direct Spring Boot call was being silently dropped (confirmed via DevTools:
 * refreshToken never appeared in the cookie jar after login). See
 * app/api/proxy-auth/login/route.ts for the full explanation.
 */

export async function login(
  email: string,
  password: string,
): Promise<ApiResponse<AuthResponse>> {
  const res = await fetch(`/api/proxy-auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return parseResponse<AuthResponse>(res);
}

export async function register(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}) {
  return apiRequest<{ message: string }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function verifyEmail(token: string) {
  return apiRequest<{ message: string }>(`/api/auth/verify?token=${token}`, {
    method: "GET",
  });
}

export async function resendVerification(email: string) {
  return apiRequest<{ message: string }>("/api/auth/resend-verification", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function forgotPassword(email: string) {
  return apiRequest<{ message: string }>("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(token: string, newPassword: string) {
  return apiRequest<{ message: string }>("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, newPassword }),
  });
}

export async function googleAuth(
  googleToken: string,
): Promise<ApiResponse<AuthResponse>> {
  const res = await fetch(`${APP_URL}/api/proxy-auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ googleToken }),
  });
  return parseResponse<AuthResponse>(res);
}

// ── Health check — public ───────────────────────────────────────────────────

export async function checkSystemHealth(): Promise<boolean> {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    const res = await fetch(`${API_URL}/actuator/health`);
    const data = await res.json();
    return data.status === "UP";
  } catch {
    return false;
  }
}