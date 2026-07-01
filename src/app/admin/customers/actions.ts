"use server";

import { revalidatePath } from "next/cache";
import {
  createWalkInCustomer,
  activateCustomer,
  deactivateCustomer,
} from "@/lib/api/auth-server";
import type { CreateWalkInInput } from "@/types/admin";

export async function createWalkInAction(input: CreateWalkInInput) {
  const res = await createWalkInCustomer(input);
  if (res.success) revalidatePath("/admin/customers");
  return res;
}

export async function activateCustomerAction(id: string) {
  const res = await activateCustomer(id);
  if (res.success) revalidatePath("/admin/customers");
  return res;
}

export async function deactivateCustomerAction(id: string) {
  const res = await deactivateCustomer(id);
  if (res.success) revalidatePath("/admin/customers");
  return res;
}