export type OccasionType = "WEDDING" | "ENGAGEMENT" | "OTHER";

export const OCCASION_TYPE_LABELS: Record<OccasionType, string> = {
  WEDDING: "Wedding",
  ENGAGEMENT: "Engagement",
  OTHER: "Other",
};

// Shape of the structured payload the form collects. Mirrors the optional
// custom-design fields on CreateAppointmentRequest (backend) — see
// lib/actions/custom-design.ts, which POSTs this to /api/appointments with
// type: "CUSTOM_CONSULTATION".
//
// referenceImages is string[] (plain Cloudinary URLs), matching
// CreateAppointmentRequest.referenceImages (List<String>) on the backend.
// There is no per-image id/publicId on the wire — that richer shape only
// exists transiently client-side in ImageUploader's UploadedImage state
// during the upload step, before it gets flattened to URLs.
export type CustomDesignRequestPayload = {
  appointmentDate: string;
  timeSlot: string;
  occasionType: OccasionType;
  occasionDate: string;
  stylePreferences: string;
  referenceImages: string[];
  notes: string;
};