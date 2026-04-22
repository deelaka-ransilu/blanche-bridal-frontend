import { apiRequest } from "./client";
import { RentalResponse, RentalStatus } from "@/types";

export const getAllRentals = (
  token: string,
  status?: RentalStatus,
  page = 0,
) => {
  const params = new URLSearchParams({ page: String(page) });
  if (status) params.set("status", status);
  return apiRequest<RentalResponse[]>(`/api/rentals?${params}`, {}, token);
};

export const getMyRentals = (token: string) =>
  apiRequest<RentalResponse[]>("/api/rentals/my", {}, token);

export const getRentalById = (id: string, token: string) =>
  apiRequest<RentalResponse>(`/api/rentals/${id}`, {}, token);

export const createRental = (
  data: {
    productId: string;
    userId: string;
    rentalStart: string;
    rentalEnd: string;
    depositAmount?: number;
    notes?: string;
    orderId?: string;
  },
  token: string,
) =>
  apiRequest<RentalResponse>(
    "/api/rentals",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    token,
  );

export const markReturned = (id: string, returnDate: string, token: string) =>
  apiRequest<RentalResponse>(
    `/api/rentals/${id}/return`,
    {
      method: "PUT",
      body: JSON.stringify({ returnDate }),
    },
    token,
  );

export const updateBalance = (id: string, balanceDue: number, token: string) =>
  apiRequest<RentalResponse>(
    `/api/rentals/${id}/balance`,
    {
      method: "PUT",
      body: JSON.stringify({ balanceDue }),
    },
    token,
  );
