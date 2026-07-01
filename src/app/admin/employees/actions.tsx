"use server";

import { revalidatePath } from "next/cache";
import {
  createEmployee,
  activateEmployee,
  deactivateEmployee,
} from "@/lib/api/auth-server";
import type { CreateUserInput } from "@/types/admin";

export async function createEmployeeAction(input: CreateUserInput) {
  const res = await createEmployee(input);
  if (res.success) revalidatePath("/admin/employees");
  return res;
}

export async function activateEmployeeAction(id: string) {
  const res = await activateEmployee(id);
  if (res.success) revalidatePath("/admin/employees");
  return res;
}

export async function deactivateEmployeeAction(id: string) {
  const res = await deactivateEmployee(id);
  if (res.success) revalidatePath("/admin/employees");
  return res;
}