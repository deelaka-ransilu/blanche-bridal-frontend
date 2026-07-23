import { createCustomDesignWalkInAction } from "@/lib/actions/custom-design-walkin";
import type { AdminUser } from "@/types/user";
import type { OccasionType } from "@/types/appointment";
import type { UploadedImage } from "@/components/products/image-uploader";

interface SubmitCustomDesignArgs {
  selectedCustomer: AdminUser;
  consultationDate: string;
  selectedSlot: string;
  occasionType: OccasionType | "";
  occasionDate: string;
  adminNotes: string;
  measurementNotes: string;
  existingDesignImages: UploadedImage[];
}

type SubmitCustomDesignResult =
  | { success: true; customDesignRequestId: string | null }
  | { success: false; message: string };

/**
 * Leaving the measurements step for CUSTOM: occasion, consultation slot,
 * notes, design images, and measurements have all been collected — create
 * the real Appointment + CustomDesignRequest pair via
 * createCustomDesignWalkInAction. The next step ("payment", repurposed)
 * shows a success card linking into the real custom-order flow instead of
 * a placeholder.
 *
 * Extracted from WalkInSalePanel.goNext() verbatim — same field mapping,
 * same "stylePreferences" folding of measurementNotes.
 */
export async function submitCustomDesignRequest(args: SubmitCustomDesignArgs): Promise<SubmitCustomDesignResult> {
  const {
    selectedCustomer,
    consultationDate,
    selectedSlot,
    occasionType,
    occasionDate,
    adminNotes,
    measurementNotes,
    existingDesignImages,
  } = args;

  const formData = new FormData();
  formData.set("customerId", selectedCustomer.id);
  formData.set("appointmentDate", consultationDate);
  formData.set("timeSlot", selectedSlot);
  formData.set("occasionType", occasionType);
  formData.set("occasionDate", occasionDate);
  formData.set("notes", adminNotes);
  // measurementNotes captured on this step folds in the same way rental
  // notes combine booking + fit-check notes in rental-booking-submit.ts.
  formData.set(
    "stylePreferences",
    measurementNotes.trim() ? `Measurement notes: ${measurementNotes.trim()}` : "",
  );
  formData.set(
    "referenceImages",
    JSON.stringify(existingDesignImages.map((img) => img.url)),
  );

  const result = await createCustomDesignWalkInAction(null, formData);

  if (!result?.success) {
    return {
      success: false,
      message: result?.message || "Could not create the custom design request. Try again before continuing.",
    };
  }
  return { success: true, customDesignRequestId: result.customDesignRequestId ?? null };
}
