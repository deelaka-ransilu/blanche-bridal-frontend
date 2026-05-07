import {
  CustomerDetailResponse,
  CreateWalkInCustomerRequest,
  MeasurementRequest,
  MeasurementsResponse,
  UpdateCustomerProfileRequest,
  User,
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export class AdminApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "AdminApiError";
    this.status = status;
  }
}

async function adminRequest<T>(
  path: string,
  token: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
      Authorization: `Bearer ${token}`,
    },
  });

  const raw = await res.text();
  const json = raw ? JSON.parse(raw) : null;

  if (res.status === 401 || res.status === 403) {
    throw new AdminApiError(
      res.status,
      json?.message ?? json?.error?.message ?? "Unauthorized",
    );
  }

  if (!res.ok) {
    throw new Error(json?.message ?? json?.error?.message ?? "Request failed");
  }

  if (json && typeof json === "object") {
    if ("data" in json) return (json.data ?? null) as T;
    if ("success" in json && json.success === true && "data" in json) {
      return (json.data ?? null) as T;
    }
  }

  return json as T;
}

export async function getCustomers(token: string) {
  return adminRequest<User[]>("/api/admin/customers", token);
}

export async function getCustomerDetail(token: string, customerId: string) {
  return adminRequest<CustomerDetailResponse>(
    `/api/admin/customers/${customerId}/detail`,
    token,
  );
}

export async function getCustomerMeasurements(token: string, customerId: string) {
  return adminRequest<MeasurementsResponse[]>(
    `/api/admin/customers/${customerId}/measurements`,
    token,
  );
}

export async function createWalkInCustomer(
  token: string,
  data: CreateWalkInCustomerRequest,
) {
  return adminRequest<User>("/api/admin/customers", token, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateCustomerProfile(
  token: string,
  customerId: string,
  data: UpdateCustomerProfileRequest,
) {
  return adminRequest<CustomerDetailResponse>(
    `/api/admin/customers/${customerId}/profile`,
    token,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
  );
}

export async function createCustomerMeasurement(
  token: string,
  customerId: string,
  data: MeasurementRequest,
) {
  return adminRequest<MeasurementsResponse>(
    `/api/admin/customers/${customerId}/measurements`,
    token,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}

export async function updateCustomerMeasurement(
  token: string,
  customerId: string,
  measurementId: string,
  data: MeasurementRequest,
) {
  return adminRequest<MeasurementsResponse>(
    `/api/admin/customers/${customerId}/measurements/${measurementId}`,
    token,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
  );
}