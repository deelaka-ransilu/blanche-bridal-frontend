export type InquiryStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  imageUrl: string | null;
  status: InquiryStatus;
  createdAt: string;
}

export interface CreateInquiryRequest {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  imageUrl?: string;
}

export const INQUIRY_STATUS_LABEL: Record<InquiryStatus, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
};