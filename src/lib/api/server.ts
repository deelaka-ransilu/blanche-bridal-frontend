/**
 * lib/api/server.ts
 *
 * Server-only API client wrapper. Import this (not client.ts directly) from
 * Server Components, Server Actions, and Route Handlers when you need
 * automatic refresh-and-retry-once on a 401 (e.g. any call using the 15-min
 * access token where the call might outlive the token).
 *
 * This file imports next/headers, so it must NEVER be imported by a
 * "use client" component — doing so will fail the build immediately (the
 * same way the original unsplit client.ts did), which is the correct,
 * loud failure mode rather than a silent runtime leak.
 */

import { cookies } from "next/headers";
import { parseResponse, type ApiResponse } from "./client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export class SessionExpiredError extends Error {
  constructor() {
    super("Session expired — please sign in again.");
    this.name = "SessionExpiredError";
  }
}

/**
 * Calls POST /api/auth/refresh, forwarding the refresh-token cookie.
 * Response shape: { success, data: { token } } — field is "token", matching
 * login/google, not "accessToken" despite the Java record's field name.
 */
async function tryRefreshAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const refreshCookie = cookieStore.get("refreshToken");
  if (!refreshCookie) return null;

  try {
    const res = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { Cookie: `refreshToken=${refreshCookie.value}` },
    });
    if (!res.ok) return null;

    const body = await res.json();
    if (!body?.success || !body?.data?.token) return null;
    return body.data.token as string;
  } catch {
    return null;
  }
}

/**
 * Authenticated server-side call with auto-refresh-and-retry-once on 401.
 * Throws SessionExpiredError if refresh also fails — the caller (a Server
 * Action or Server Component) should catch this and redirect to /login,
 * since signOut() is a client-side NextAuth API and can't run server-side.
 */
export async function apiRequestWithRefresh<T>(
  path: string,
  options: RequestInit,
  token: string,
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
    Authorization: `Bearer ${token}`,
  };

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (res.status !== 401) {
    return parseResponse<T>(res);
  }

  const newAccessToken = await tryRefreshAccessToken();
  if (!newAccessToken) {
    throw new SessionExpiredError();
  }

  const retryRes = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { ...headers, Authorization: `Bearer ${newAccessToken}` },
    credentials: "include",
  });

  if (retryRes.status === 401) {
    throw new SessionExpiredError();
  }

  return parseResponse<T>(retryRes);
}