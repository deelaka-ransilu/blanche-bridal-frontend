const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; message: string; error?: string; fields?: Record<string, string>; authError?: boolean };

export async function parseResponse<T>(res: Response): Promise<ApiResponse<T>> {
  const text = await res.text();
  if (!text) {
    return res.ok
      ? ({ success: true, data: undefined } as ApiResponse<T>)
      : {
          success: false,
          message: "Something went wrong. Please try again.",
          ...(res.status === 403 ? { authError: true } : {}),
        };
  }
  try {
    const parsed = JSON.parse(text) as ApiResponse<T>;
    // Backend's 403-with-real-body case (valid token, user inactive/not found)
    // still needs the authError flag even though it has a real message.
    if (res.status === 403 && parsed.success === false) {
      return { ...parsed, authError: true };
    }
    return parsed;
  } catch {
    return { success: false, message: "Unexpected response from server." };
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers, credentials: "include" });
  return parseResponse<T>(res);
}