"use server";

import { revalidatePath } from "next/cache";
import { apiRequestWithRefresh } from "@/lib/api/server";
import type { AdminUser } from "@/types/user";
import { getMyProfile as getMyProfileApi } from "@/lib/api/customers";

export async function getMyProfileAction() {
  return getMyProfileApi();
}

export type CustomerActionState = {
  success: boolean;
  message?: string;
} | null;

export async function deactivateCustomerAction(
  id: string,
  _prevState: CustomerActionState,
): Promise<CustomerActionState> {
  const result = await apiRequestWithRefresh<AdminUser>(`/api/admin/customers/${id}/deactivate`, {
    method: "PUT",
  });
  revalidatePath("/admin/users");
  if (!result.success) {
    return { success: false, message: result.message };
  }
  return { success: true };
}

export async function activateCustomerAction(
  id: string,
  _prevState: CustomerActionState,
): Promise<CustomerActionState> {
  const result = await apiRequestWithRefresh<AdminUser>(`/api/admin/customers/${id}/activate`, {
    method: "PUT",
  });
  revalidatePath("/admin/users");
  if (!result.success) {
    return { success: false, message: result.message };
  }
  return { success: true };
}

export async function updateCustomerProfileAction(
  customerId: string,
  formData: FormData,
): Promise<void> {
  const adminNotes = formData.get("adminNotes") as string;
  const designImageUrls = JSON.parse((formData.get("designImageUrls") as string) || "[]");

  const result = await apiRequestWithRefresh(`/api/admin/customers/${customerId}/profile`, {
    method: "PUT",
    body: JSON.stringify({ adminNotes, designImageUrls }),
  });

  if (!result.success) {
    console.error(`[updateCustomerProfileAction] failed for ${customerId}: ${result.message}`);
  }
  revalidatePath(`/admin/customers/${customerId}`);
}

export type MeasurementFormState = {
  success: boolean;
  message?: string;
  fields?: Record<string, string>;
} | null;

export async function addMeasurementAction(
  customerId: string,
  _prevState: MeasurementFormState,
  formData: FormData,
): Promise<MeasurementFormState> {
  const body = buildMeasurementBody(formData);

  const validationError = validateMeasurementBody(body);
  if (validationError) {
    return { success: false, message: validationError };
  }

  const result = await apiRequestWithRefresh(`/api/admin/customers/${customerId}/measurements`, {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (!result.success) {
    return { success: false, message: result.message, fields: result.fields };
  }

  revalidatePath(`/admin/customers/${customerId}`);
  return { success: true, message: "Measurement set saved." };
}

export async function updateMeasurementAction(
  customerId: string,
  measurementId: string,
  _prevState: MeasurementFormState,
  formData: FormData,
): Promise<MeasurementFormState> {
  const body = buildMeasurementBody(formData);

  const validationError = validateMeasurementBody(body);
  if (validationError) {
    return { success: false, message: validationError };
  }

  const result = await apiRequestWithRefresh(
    `/api/admin/customers/${customerId}/measurements/${measurementId}`,
    { method: "PUT", body: JSON.stringify(body) }
  );

  if (!result.success) {
    return { success: false, message: result.message, fields: result.fields };
  }

  revalidatePath(`/admin/customers/${customerId}`);
  return { success: true, message: "Measurement set updated." };
}

function buildMeasurementBody(formData: FormData) {
  const numOrNull = (key: string) => {
    const v = formData.get(key);
    if (v === "" || v === null) return null;
    const n = Number(v);
    return n;
  };

  return {
    heightWithShoes: numOrNull("heightWithShoes"),
    hollowToHem: numOrNull("hollowToHem"),
    fullBust: numOrNull("fullBust"),
    underBust: numOrNull("underBust"),
    naturalWaist: numOrNull("naturalWaist"),
    fullHip: numOrNull("fullHip"),
    shoulderWidth: numOrNull("shoulderWidth"),
    torsoLength: numOrNull("torsoLength"),
    thighCircumference: numOrNull("thighCircumference"),
    waistToKnee: numOrNull("waistToKnee"),
    waistToFloor: numOrNull("waistToFloor"),
    armhole: numOrNull("armhole"),
    bicepCircumference: numOrNull("bicepCircumference"),
    elbowCircumference: numOrNull("elbowCircumference"),
    wristCircumference: numOrNull("wristCircumference"),
    sleeveLength: numOrNull("sleeveLength"),
    upperBust: numOrNull("upperBust"),
    bustApexDistance: numOrNull("bustApexDistance"),
    shoulderToBustPoint: numOrNull("shoulderToBustPoint"),
    neckCircumference: numOrNull("neckCircumference"),
    trainLength: numOrNull("trainLength"),
    notes: (formData.get("notes") as string) || null,
  };
}

function validateMeasurementBody(body: Record<string, unknown>): string | null {
  for (const [key, value] of Object.entries(body)) {
    if (key === "notes") continue;
    if (typeof value === "number" && (value < 0 || value > 999.99)) {
      return `One of the measurement values is out of range (must be between 0 and 999.99).`;
    }
  }
  return null;
}

export type WalkInCustomerFormState = {
  success: boolean;
  message?: string;
  fields?: Record<string, string>;
} | null;

export async function createWalkInCustomerAction(
  _prevState: WalkInCustomerFormState,
  formData: FormData,
): Promise<WalkInCustomerFormState> {
  const email = formData.get("email") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const phone = (formData.get("phone") as string) || null;

  const body = { email, firstName, lastName, phone };

  const result = await apiRequestWithRefresh(`/api/admin/customers`, {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (!result.success) {
    return { success: false, message: result.message, fields: result.fields };
  }

  revalidatePath("/admin/users");
  return { success: true, message: `${firstName} ${lastName} added as an active customer.` };
}

// ── Customer self-service (CUSTOMER role, own record only) ────────────────

export type ProfileFormState = {
  success: boolean;
  message?: string;
  fields?: Record<string, string>;
} | null;

export async function updateMyProfileAction(
  _prevState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const body = {
    firstName: formData.get("firstName") as string,
    lastName: formData.get("lastName") as string,
    phone: (formData.get("phone") as string) || null,
    address: (formData.get("address") as string) || null,
  };

  const result = await apiRequestWithRefresh("/api/users/me", {
    method: "PUT",
    body: JSON.stringify(body),
  });

  if (!result.success) {
    return { success: false, message: result.message, fields: result.fields };
  }

  revalidatePath("/my/settings");
  return { success: true, message: "Profile updated." };
}