import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiRequest } from "@/lib/api/client";
import type { AdminUser } from "@/types/user";

export type CustomerListResult =
  | { success: true; data: AdminUser[] }
  | { success: false; message: string; error?: string; fields?: Record<string, string> };

async function getToken(): Promise<string | undefined> {
  const session = await getServerSession(authOptions);
  return session?.user?.backendToken as string | undefined;
}

export async function getCustomers(): Promise<CustomerListResult> {
  const token = await getToken();
  const result = await apiRequest<AdminUser[]>("/api/admin/customers", { method: "GET" }, token);
  return result as unknown as CustomerListResult;
}