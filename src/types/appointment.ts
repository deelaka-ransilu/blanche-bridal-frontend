export type AppointmentStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
export type AppointmentType = "FITTING" | "RENTAL_PICKUP" | "PURCHASE" | "CUSTOM_CONSULTATION";

// Mirrors OccasionType on the backend — only meaningful when
// type === "CUSTOM_CONSULTATION".
export type OccasionType = "WEDDING" | "ENGAGEMENT" | "OTHER";

export interface Appointment {
  id: string;
  userId: string | null;
  customerName: string | null;
  customerEmail: string | null;
  productId: string | null;
  productName: string | null;
  appointmentDate: string; // LocalDate -> "YYYY-MM-DD"
  timeSlot: string;
  type: AppointmentType;
  status: AppointmentStatus;
  googleEventId: string | null;
  notes: string | null;
  createdAt: string; // LocalDateTime -> ISO string

  // ── CUSTOM_CONSULTATION-only fields ─────────────────────────────────
  // Null/undefined for FITTING/RENTAL_PICKUP/PURCHASE — only populated
  // when type === "CUSTOM_CONSULTATION" (see AppointmentServiceImpl.toResponse).
  occasionType?: OccasionType | null;
  occasionDate?: string | null; // LocalDate -> "YYYY-MM-DD"
  stylePreferences?: string | null;
  referenceImages?: string[] | null;
}