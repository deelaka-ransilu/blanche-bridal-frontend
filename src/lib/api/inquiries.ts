import { apiRequest } from "./client";
import { InquiryResponse, InquiryStatus, CreateInquiryPayload } from "@/types";

export const submitInquiry = (data: CreateInquiryPayload) =>
  apiRequest<InquiryResponse>("/api/inquiries", {
    method: "POST",
    body: JSON.stringify(data),
  });

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
