/**
 * lib/api/auth-server.ts
 *
 * AUTHENTICATED auth-related endpoints — profile, admin employee/customer
 * management. All require a token and use apiRequestWithRefresh (auto-refresh-
 * and-retry-once on 401). This file imports lib/api/server.ts, which imports
 * next/headers — so this file must only ever be imported from Server
 * Components, Server Actions, or Route Handlers, never a "use client"
 * component. Importing this from a client component will fail the build,
 * the same way the original unsplit client.ts did — that's the intended,
 * loud failure mode.
 */
import { apiRequestWithRefresh } from "./server";
import { User, Measurements } from "@/types";

// ── Profile ──────────────────────────────────────────────────────────────────

export async function getProfile(token: string) {
  return apiRequestWithRefresh<User>("/api/users/me", {}, token);
}

export async function updateProfile(
  token: string,
  data: { firstName?: string; lastName?: string; phone?: string },
) {
  return apiRequestWithRefresh<User>(
    "/api/users/me",
    { method: "PUT", body: JSON.stringify(data) },
    token,
  );
}

// ── Measurements ──────────────────────────────────────────────────────────────

export async function getMyMeasurements(token: string) {
  return apiRequestWithRefresh<Measurements[]>(
    "/api/users/me/measurements",
    {},
    token,
  );
}

// ── Admin — employees ─────────────────────────────────────────────────────────

export async function listEmployees(token: string) {
  return apiRequestWithRefresh<User[]>("/api/admin/employees", {}, token);
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
  return apiRequestWithRefresh<User>(
    "/api/admin/employees",
    { method: "POST", body: JSON.stringify(data) },
    token,
  );
}

export async function activateEmployee(token: string, employeeId: string) {
  return apiRequestWithRefresh<User>(
    `/api/admin/employees/${employeeId}/activate`,
    { method: "PUT" },
    token,
  );
}

export async function deactivateEmployee(token: string, employeeId: string) {
  return apiRequestWithRefresh<User>(
    `/api/admin/employees/${employeeId}/deactivate`,
    { method: "PUT" },
    token,
  );
}

// ── Admin — customers ─────────────────────────────────────────────────────────

export async function listCustomers(token: string) {
  return apiRequestWithRefresh<User[]>("/api/admin/customers", {}, token);
}

export async function getCustomer(token: string, customerId: string) {
  return apiRequestWithRefresh<User>(
    `/api/admin/customers/${customerId}`,
    {},
    token,
  );
}

export async function activateCustomer(token: string, customerId: string) {
  return apiRequestWithRefresh<User>(
    `/api/admin/customers/${customerId}/activate`,
    { method: "PUT" },
    token,
  );
}

export async function deactivateCustomer(token: string, customerId: string) {
  return apiRequestWithRefresh<User>(
    `/api/admin/customers/${customerId}/deactivate`,
    { method: "PUT" },
    token,
  );
}

/*
 * REMOVED: listAdmins / createAdmin / activateAdmin / deactivateAdmin (superadmin
 * endpoints). Per the Step 0 locked decisions, SUPERADMIN does not exist in the
 * rebuild — these called /api/superadmin/admins, which no longer exists in
 * SecurityConfig. The 2 frontend pages that still imported these
 * (superadmin/admins/page.tsx, superadmin/dashboard/page.tsx) need to be
 * deleted or rewritten against /api/admin/* — see the build-error triage notes.
 */