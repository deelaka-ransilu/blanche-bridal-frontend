import { apiRequest } from "./client";
import { AuthResponse, User, Measurements } from "@/types";

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function login(email: string, password: string) {
  return apiRequest<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
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

// Verify email — token comes from URL ?token=xxx
export async function verifyEmail(token: string) {
  return apiRequest<{ message: string }>(`/api/auth/verify?token=${token}`, {
    method: "GET",
  });
}

// Resend the 5-minute verification email
export async function resendVerification(email: string) {
  return apiRequest<{ message: string }>("/api/auth/resend-verification", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

// Send forgot password email
export async function forgotPassword(email: string) {
  return apiRequest<{ message: string }>("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

// Submit new password with reset token
export async function resetPassword(token: string, newPassword: string) {
  return apiRequest<{ message: string }>("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, newPassword }),
  });
}

// ── Profile ───────────────────────────────────────────────────────────────────

export async function getProfile(token: string) {
  return apiRequest<User>("/api/users/me", {}, token);
}

export async function updateProfile(
  token: string,
  data: { firstName?: string; lastName?: string; phone?: string },
) {
  return apiRequest<User>(
    "/api/users/me",
    { method: "PUT", body: JSON.stringify(data) },
    token,
  );
}

// ── Measurements ──────────────────────────────────────────────────────────────

export async function getMyMeasurements(token: string) {
  return apiRequest<Measurements[]>("/api/users/me/measurements", {}, token);
}

// ── Admin management ──────────────────────────────────────────────────────────

export async function listEmployees(token: string) {
  return apiRequest<User[]>("/api/admin/employees", {}, token);
}

export async function listCustomers(token: string) {
  return apiRequest<User[]>("/api/admin/customers", {}, token);
}

// ── Superadmin management ─────────────────────────────────────────────────────

export async function listAdmins(token: string) {
  return apiRequest<User[]>("/api/superadmin/admins", {}, token);
}

export async function googleAuth(googleToken: string) {
  return apiRequest<AuthResponse>("/api/auth/google", {
    method: "POST",
    body: JSON.stringify({ googleToken }),
  });
}
