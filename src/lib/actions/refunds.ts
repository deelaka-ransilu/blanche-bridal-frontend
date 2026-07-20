"use server";

import { revalidatePath } from "next/cache";
import { apiRequestWithRefresh } from "@/lib/api/server";
import type { Refund, BankDetails } from "@/types/refund";

export type RefundOrderState = {
  success: boolean;
  message?: string;
  data?: Refund;
} | null;

export async function refundOrderAction(
  orderId: string,
  _prevState: RefundOrderState,
  formData: FormData,
): Promise<RefundOrderState> {
  const reason = (formData.get("reason") as string) || undefined;
  const proofImageUrl = formData.get("proofImageUrl") as string;

  if (!proofImageUrl) {
    return { success: false, message: "Upload proof of the bank transfer first." };
  }

  const result = await apiRequestWithRefresh<Refund>(`/api/orders/${orderId}/refund`, {
    method: "POST",
    body: JSON.stringify({ reason, proofImageUrl }),
  });

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");

  if (!result.success) {
    return { success: false, message: result.message };
  }

  return { success: true, message: "Refund issued.", data: result.data };
}

export type SubmitBankDetailsState = {
  success: boolean;
  message?: string;
  data?: BankDetails;
} | null;

export async function submitBankDetailsAction(
  orderId: string,
  _prevState: SubmitBankDetailsState,
  formData: FormData,
): Promise<SubmitBankDetailsState> {
  const accountHolderName = formData.get("accountHolderName") as string;
  const accountNumber = formData.get("accountNumber") as string;
  const bankName = formData.get("bankName") as string;
  const branch = (formData.get("branch") as string) || undefined;

  const result = await apiRequestWithRefresh<BankDetails>(`/api/orders/${orderId}/bank-details`, {
    method: "POST",
    body: JSON.stringify({ accountHolderName, accountNumber, bankName, branch }),
  });

  revalidatePath(`/my/orders/${orderId}`);

  if (!result.success) {
    return { success: false, message: result.message };
  }

  return { success: true, message: "Bank details submitted.", data: result.data };
}