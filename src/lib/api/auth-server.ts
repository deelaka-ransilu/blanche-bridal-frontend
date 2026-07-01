import { apiRequestWithRefresh } from "./server";
import type {
  AdminUser,
  CustomerDetail,
  CreateUserInput,
  CreateWalkInInput,
} from "@/types/admin";

// ── Employees ─────────────────────────────────────────────────────────────

export async function listEmployees() {
  return apiRequestWithRefresh<AdminUser[]>("/api/admin/employees");
}

export async function createEmployee(input: CreateUserInput) {
  return apiRequestWithRefresh<AdminUser>("/api/admin/employees", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function activateEmployee(id: string) {
  return apiRequestWithRefresh<AdminUser>(
    `/api/admin/employees/${id}/activate`,
    { method: "PUT" },
  );
}

export async function deactivateEmployee(id: string) {
  return apiRequestWithRefresh<AdminUser>(
    `/api/admin/employees/${id}/deactivate`,
    { method: "PUT" },
  );
}

// ── Customers ─────────────────────────────────────────────────────────────

export async function listCustomers() {
  return apiRequestWithRefresh<AdminUser[]>("/api/admin/customers");
}

export async function getCustomer(id: string) {
  return apiRequestWithRefresh<AdminUser>(`/api/admin/customers/${id}`);
}

export async function getCustomerDetail(id: string) {
  return apiRequestWithRefresh<CustomerDetail>(
    `/api/admin/customers/${id}/detail`,
  );
}

export async function createWalkInCustomer(input: CreateWalkInInput) {
  return apiRequestWithRefresh<AdminUser>("/api/admin/customers", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function activateCustomer(id: string) {
  return apiRequestWithRefresh<AdminUser>(
    `/api/admin/customers/${id}/activate`,
    { method: "PUT" },
  );
}

export async function deactivateCustomer(id: string) {
  return apiRequestWithRefresh<AdminUser>(
    `/api/admin/customers/${id}/deactivate`,
    { method: "PUT" },
  );
}