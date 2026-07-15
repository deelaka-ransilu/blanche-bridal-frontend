export type OccasionType = "WEDDING" | "ENGAGEMENT" | "OTHER";

export const OCCASION_TYPE_LABELS: Record<OccasionType, string> = {
  WEDDING: "Wedding",
  ENGAGEMENT: "Engagement",
  OTHER: "Other",
};

export type ReferenceImage = { id: string; url: string; publicId: string | null };

// Shape of the structured payload the form collects. Mirrors the optional
// custom-design fields on CreateAppointmentRequest (backend) — see
// lib/actions/custom-design.ts, which POSTs this to /api/appointments with
// type: "CUSTOM_CONSULTATION".
export type CustomDesignRequestPayload = {
  appointmentDate: string;
  timeSlot: string;
  occasionType: OccasionType;
  occasionDate: string;
  stylePreferences: string;
  referenceImages: ReferenceImage[];
  notes: string;
};