import { apiRequest, parseResponse, type ApiResponse } from "./client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export type AuthResponse = { token: string | null; role: string | null; refreshToken?: string | null };

export async function login(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
  const res = await fetch(`/api/proxy-auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return parseResponse<AuthResponse>(res);
}

export async function verifyEmail(token: string): Promise<ApiResponse<{ message: string }>> {
  const res = await fetch(`${API_URL}/api/auth/verify?token=${token}`, { method: "GET" });
  return parseResponse(res);
}

export async function register(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
}): Promise<ApiResponse<{ message: string }>> {
  return apiRequest("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function forgotPassword(email: string) {
  const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return res.json() as Promise<{ success: boolean; message?: string; error?: string }>;
}

export async function resetPassword(token: string, newPassword: string) {
  const res = await fetch(`${API_URL}/api/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, newPassword }),
  });
  return res.json() as Promise<{ success: boolean; message?: string }>;
}