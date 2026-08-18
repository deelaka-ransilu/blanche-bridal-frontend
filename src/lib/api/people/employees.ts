import { apiRequest } from "@/lib/api/client";
import { getToken } from "@/lib/api/server";
import type { AdminUser } from "@/types/user";

export type EmployeeListResult =
  | { success: true; data: AdminUser[] }
  | { success: false; message: string; error?: string; fields?: Record<string, string> };

export async function getEmployees(): Promise<EmployeeListResult> {
  const token = await getToken();
  const result = await apiRequest<AdminUser[]>("/api/admin/employees", { method: "GET" }, token);
  return result as unknown as EmployeeListResult;
}