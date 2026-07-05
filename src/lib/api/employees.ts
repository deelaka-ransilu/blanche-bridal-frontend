import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiRequest } from "@/lib/api/client";
import type { AdminUser } from "@/types/user";

export type EmployeeListResult =
  | { success: true; data: AdminUser[] }
  | { success: false; message: string; error?: string; fields?: Record<string, string> };

async function getToken(): Promise<string | undefined> {
  const session = await getServerSession(authOptions);
  return session?.user?.backendToken as string | undefined;
}

export async function getEmployees(): Promise<EmployeeListResult> {
  const token = await getToken();
  const result = await apiRequest<AdminUser[]>("/api/admin/employees", { method: "GET" }, token);
  return result as unknown as EmployeeListResult;
}