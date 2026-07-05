"use server";

import { revalidatePath } from "next/cache";
import { apiRequestWithRefresh } from "@/lib/api/server";
import type { AdminUser } from "@/types/user";

export async function deactivateCustomerAction(id: string): Promise<void> {
  const result = await apiRequestWithRefresh<AdminUser>(`/api/admin/customers/${id}/deactivate`, {
    method: "PUT",
  });
  if (!result.success) {
    console.error(`[deactivateCustomerAction] failed for ${id}: ${result.message}`);
  }
  revalidatePath("/admin/customers");
}

export async function activateCustomerAction(id: string): Promise<void> {
  const result = await apiRequestWithRefresh<AdminUser>(`/api/admin/customers/${id}/activate`, {
    method: "PUT",
  });
  if (!result.success) {
    console.error(`[activateCustomerAction] failed for ${id}: ${result.message}`);
  }
  revalidatePath("/admin/customers");
}