import { createRentalBookingAction } from "@/lib/actions/rentals";
import type { AdminUser } from "@/types/user";
import type { RentableProduct } from "@/types/rental";

interface SubmitRentalBookingArgs {
  selectedCustomer: AdminUser;
  selectedGown: RentableProduct;
  rentalStart: string;
  rentalEnd: string;
  rentalPaymentMethod: string;
  rentalNotes: string;
  measurementNotes: string;
}

type SubmitRentalBookingResult =
  | { success: true; orderId: string | null }
  | { success: false; message: string };

/**
 * Leaving the measurements step for RENTAL: the gown, dates, booking
 * notes, and fit-check notes are all finalized now — create the real
 * Order + Rental pair via createRentalBookingAction. The next step is
 * "payment", which shows the full rental amount due against this booking.
 *
 * Extracted from WalkInSalePanel.goNext() verbatim (same combined-notes
 * logic, same form fields) — only the state reads/writes were replaced
 * with plain args/return values.
 */
export async function submitRentalBooking(args: SubmitRentalBookingArgs): Promise<SubmitRentalBookingResult> {
  const { selectedCustomer, selectedGown, rentalStart, rentalEnd, rentalPaymentMethod, rentalNotes, measurementNotes } = args;

  // Rental.notes is a single text field — combine the booking-specific
  // notes (from the consultation step) with the fit-check/alteration
  // notes (from measurements) rather than picking just one.
  const combinedNotes = [
    rentalNotes.trim(),
    measurementNotes.trim() ? `Fit notes: ${measurementNotes.trim()}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  const formData = new FormData();
  formData.set("customerId", selectedCustomer.id);
  formData.set("productId", selectedGown.id);
  formData.set("rentalStart", rentalStart);
  formData.set("rentalEnd", rentalEnd);
  formData.set("paymentMethod", rentalPaymentMethod);
  formData.set("notes", combinedNotes);

  const result = await createRentalBookingAction(null, formData);

  if (!result?.success) {
    return { success: false, message: result?.message || "Could not create the rental booking. Try again before continuing." };
  }
  return { success: true, orderId: result.orderId ?? null };
}
