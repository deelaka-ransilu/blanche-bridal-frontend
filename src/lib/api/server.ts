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

export async function getToken(): Promise<string | undefined> {
  const session = await getServerSession(authOptions);
  return session?.user?.backendToken as string | undefined;
}