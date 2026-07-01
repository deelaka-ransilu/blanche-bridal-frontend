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
export async function apiRequestWithRefresh<T>(
  path: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
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

  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (!newToken) {
      return { success: false, message: "Session expired. Please log in again." };
    }
    res = await doFetch(newToken);
  }

  return parseResponse<T>(res);
}