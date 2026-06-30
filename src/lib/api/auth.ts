import { parseResponse, type ApiResponse } from "./client";

export type AuthResponse = { token: string; role: string };

export async function login(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
  const res = await fetch(`/api/proxy-auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return parseResponse<AuthResponse>(res);
}

const APP_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

export async function googleAuth(googleToken: string): Promise<ApiResponse<AuthResponse>> {
  const res = await fetch(`${APP_URL}/api/proxy-auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ googleToken }),
  });
  return parseResponse<AuthResponse>(res);
}