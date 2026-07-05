import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiRequest } from "@/lib/api/client";
import type { AdminUser } from "@/types/user";
import type { CustomerDetail } from "@/types/customer";

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

export type CustomerDetailResult =
  | { success: true; data: CustomerDetail }
  | { success: false; message: string; error?: string; fields?: Record<string, string> };

export async function getCustomerDetail(customerId: string): Promise<CustomerDetailResult> {
  const token = await getToken();
  const result = await apiRequest<CustomerDetail>(
    `/api/admin/customers/${customerId}/detail`,
    { method: "GET" },
    token
  );
  return result as unknown as CustomerDetailResult;
}