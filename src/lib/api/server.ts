import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { parseResponse, type ApiResponse } from "./client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

async function refreshAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const res = await fetch(`${API_URL}/api/auth/refresh`, {
    method: "POST",
    headers: { Cookie: cookieHeader },
  });

  // Backend rotates refreshToken on every call — forward the new one
  // back to the browser. This only works in a Server Action / Route Handler.
  const setCookies = res.headers.getSetCookie?.() ?? [];
  for (const cookie of setCookies) {
    const [nameValue] = cookie.split(";");
    const [name, value] = nameValue.split("=");
    if (name && value) {
      cookieStore.set(name, decodeURIComponent(value));
    }
  }

  if (!res.ok) return null;

  const data = await parseResponse<{ token: string }>(res);
  return data.success ? (data.data?.token ?? null) : null;
}

/**
 * Authenticated server-side request with automatic 401 retry-via-refresh.
 *
 * IMPORTANT: only call this from a Server Action or Route Handler.
 * A successful refresh rewrites the httpOnly refreshToken cookie, which
 * Next.js does not permit during a Server Component render.
 */
/**
 * Authenticated fetch with automatic 401 retry-via-refresh, returning the
 * raw Response. Shared by apiRequestWithRefresh below (which parses it as
 * ApiResponse<T>) and by any caller with a non-enveloped response shape
 * (see lib/actions/production.ts) that can't use apiRequestWithRefresh's
 * ApiResponse<T> assumption.
 *
 * IMPORTANT: only call this from a Server Action or Route Handler — same
 * restriction as apiRequestWithRefresh, for the same cookie-write reason.
 */
export async function fetchWithRefresh(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const session = await getServerSession(authOptions);
  const token = session?.user?.backendToken as string | undefined;

  const doFetch = async (bearer?: string) => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };
    if (bearer) headers["Authorization"] = `Bearer ${bearer}`;
    return fetch(`${API_URL}${path}`, { ...options, headers });
  };

  let res = await doFetch(token);

  if (res.status === 401 || res.status === 403) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      res = await doFetch(newToken);
    }
  }

  return res;
}

export async function apiRequestWithRefresh<T>(
  path: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const res = await fetchWithRefresh(path, options);
  return parseResponse<T>(res);
}

/**
 * Shared session-token lookup, used by nearly every lib/api/*.ts file.
 * Centralized so the getServerSession/authOptions wiring only lives in one
 * place. Lives here (not client.ts) because it needs next-auth's server
 * session — pulling it into client.ts drags next/headers into any client
 * component that imports anything from client.ts.
 */
export async function getToken(): Promise<string | undefined> {
  const session = await getServerSession(authOptions);
  return session?.user?.backendToken as string | undefined;
}