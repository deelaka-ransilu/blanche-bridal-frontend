"use server";

import { revalidatePath } from "next/cache";
import { apiRequestWithRefresh } from "@/lib/api/server";
import type { AdminUser } from "@/types/user";

export type EmployeeFormState = {
  success: boolean;
  message?: string;
  fields?: Record<string, string>;
} | null;

export async function createEmployeeAction(
  _prevState: EmployeeFormState,
  formData: FormData,
): Promise<EmployeeFormState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const phone = formData.get("phone") as string;

  const result = await apiRequestWithRefresh<AdminUser>("/api/admin/employees", {
    method: "POST",
    body: JSON.stringify({ email, password, firstName, lastName, phone: phone || undefined }),
  });

  if (!result.success) {
    return { success: false, message: result.message, fields: result.fields };
  }

  revalidatePath("/admin/employees");
  return { success: true, message: "Employee created." };
}

export async function deactivateEmployeeAction(id: string): Promise<void> {
  const result = await apiRequestWithRefresh<AdminUser>(`/api/admin/employees/${id}/deactivate`, {
    method: "PUT",
  });
  if (!result.success) {
    console.error(`[deactivateEmployeeAction] failed for ${id}: ${result.message}`);
  }
  revalidatePath("/admin/employees");
}

export async function activateEmployeeAction(id: string): Promise<void> {
  const result = await apiRequestWithRefresh<AdminUser>(`/api/admin/employees/${id}/activate`, {
    method: "PUT",
  });
  if (!result.success) {
    console.error(`[activateEmployeeAction] failed for ${id}: ${result.message}`);
  }
  revalidatePath("/admin/employees");
}