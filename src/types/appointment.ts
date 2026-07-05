export type AppointmentStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
export type AppointmentType = "FITTING" | "RENTAL_PICKUP" | "PURCHASE";

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
}