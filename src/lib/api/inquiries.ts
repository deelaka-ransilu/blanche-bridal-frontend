import { apiRequest } from "./client";
import { InquiryResponse, InquiryStatus, CreateInquiryPayload } from "@/types";

// Optional token — logged-in customers pass it so /my can match by email
export const submitInquiry = (
  data: CreateInquiryPayload,
  token?: string,
) =>
  apiRequest<InquiryResponse>(
    "/api/inquiries",
    { method: "POST", body: JSON.stringify(data) },
    token,
  );

export const getAllInquiries = (
  token: string,
  status?: InquiryStatus,
  page = 0,
) => {
  const params = new URLSearchParams({ page: String(page) });
  if (status) params.set("status", status);
  return apiRequest<InquiryResponse[]>(`/api/inquiries?${params}`, {}, token);
};

export const getInquiryById = (id: string, token: string) =>
  apiRequest<InquiryResponse>(`/api/inquiries/${id}`, {}, token);

export const updateInquiryStatus = (
  id: string,
  status: InquiryStatus,
  token: string,
) =>
  apiRequest<InquiryResponse>(
    `/api/inquiries/${id}/status`,
    {
      method: "PUT",
      body: JSON.stringify({ status }),
    },
    token,
  );

// Customer — fetch own inquiries (matched by account email on backend)
export const getMyInquiries = (token: string) =>
  apiRequest<InquiryResponse[]>("/api/inquiries/my", {}, token);

export async function sendInquiryReply(
  id: string,
  message: string,
  token: string,
) {
  return apiRequest(
    `/api/inquiries/${id}/reply`,
    { method: "POST", body: JSON.stringify({ message }) },
    token,
  );
}