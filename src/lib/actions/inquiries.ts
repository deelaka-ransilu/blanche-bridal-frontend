"use server";

import { revalidatePath } from "next/cache";
import { apiRequest } from "@/lib/api/client";
import { apiRequestWithRefresh } from "@/lib/api/server";
import { CreateInquiryRequest, InquiryStatus } from "@/types/inquiry";

// Public: submit -- no auth needed, useActionState for inline validation
export async function submitInquiryAction(
  prevState: { success: boolean; message: string } | null,
  formData: FormData,
): Promise<{ success: boolean; message: string }> {
  const payload: CreateInquiryRequest = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    phone: (formData.get("phone") as string) || undefined,
    subject: (formData.get("subject") as string) || undefined,
    message: formData.get("message") as string,
    imageUrl: (formData.get("imageUrl") as string) || undefined,
  };
  const res = await apiRequest("/api/inquiries", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  console.log("INQUIRY SUBMIT RESULT:", JSON.stringify(res, null, 2)); // TEMP DEBUG

  if (!res.success) {
    return { success: false, message: "Failed to send your inquiry. Please try again." };
  }
  return { success: true, message: "Your inquiry has been sent. We'll be in touch soon." };
}

// Admin: update status -- void-return, matches list-mutation convention
// Admin: update status -- void-return, matches list-mutation convention
export async function updateInquiryStatusAction(id: string, formData: FormData): Promise<void> {
  const status = formData.get("status") as InquiryStatus;

  await apiRequestWithRefresh(`/api/inquiries/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
  revalidatePath("/admin/bookings");
}

// Admin: send reply -- useActionState (expected validation case).
// Backend auto-flips OPEN -> IN_PROGRESS on reply; revalidate reflects that.
export async function sendInquiryReplyAction(
  id: string,
  prevState: { success: boolean; message: string } | null,
  formData: FormData,
): Promise<{ success: boolean; message: string }> {
  const message = formData.get("message") as string;

  const res = await apiRequestWithRefresh(`/api/inquiries/${id}/reply`, {
    method: "POST",
    body: JSON.stringify({ message }),
  });

  revalidatePath("/admin/bookings");

  if (!res.success) {
    return { success: false, message: "Failed to send reply." };
  }
  return { success: true, message: "Reply sent — inquiry marked In Progress." };
}