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

export async function googleAuth(googleToken: string) {
  return apiRequest<AuthResponse>("/api/auth/google", {
    method: "POST",
    body: JSON.stringify({ googleToken }),
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

// ── Admin — employees ─────────────────────────────────────────────────────────

export async function listEmployees(token: string) {
  return apiRequest<User[]>("/api/admin/employees", {}, token);
}

export async function createEmployee(
  token: string,
  data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  },
) {
  return apiRequest<User>(
    "/api/admin/employees",
    { method: "POST", body: JSON.stringify(data) },
    token,
  );
}

export async function activateEmployee(token: string, employeeId: string) {
  return apiRequest<User>(
    `/api/admin/employees/${employeeId}/activate`,
    { method: "PUT" },
    token,
  );
}

export async function deactivateEmployee(token: string, employeeId: string) {
  return apiRequest<User>(
    `/api/admin/employees/${employeeId}/deactivate`,
    { method: "PUT" },
    token,
  );
}

// ── Admin — customers ─────────────────────────────────────────────────────────

export async function listCustomers(token: string) {
  return apiRequest<User[]>("/api/admin/customers", {}, token);
}

export async function getCustomer(token: string, customerId: string) {
  return apiRequest<User>(`/api/admin/customers/${customerId}`, {}, token);
}

// ── Superadmin — admins ───────────────────────────────────────────────────────

export async function listAdmins(token: string) {
  return apiRequest<User[]>("/api/superadmin/admins", {}, token);
}

export async function createAdmin(
  token: string,
  data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  },
) {
  return apiRequest<User>(
    "/api/superadmin/admins",
    { method: "POST", body: JSON.stringify(data) },
    token,
  );
}

export async function activateAdmin(token: string, adminId: string) {
  return apiRequest<User>(
    `/api/superadmin/admins/${adminId}/activate`,
    { method: "PUT" },
    token,
  );
}

export async function deactivateAdmin(token: string, adminId: string) {
  return apiRequest<User>(
    `/api/superadmin/admins/${adminId}/deactivate`,
    { method: "PUT" },
    token,
  );
}