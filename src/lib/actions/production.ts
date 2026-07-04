"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// ProductionStageRecordController returns the raw record with no
// {success, data} envelope (see lib/api/production.ts for the read-side
// version of this same issue) -- so these use a dedicated raw-record fetch
// rather than apiRequestWithRefresh/parseResponse, which assume ApiResponse<T>.
//
// NOTE ON RETURN TYPE: these are bound directly to <form action={...}>, which
// per React's types requires (formData: FormData) => void | Promise<void>.
// Returning the result object (as an earlier version of this file did) fails
// type-checking. So these intentionally return void -- success/failure is
// only reflected via revalidatePath's refetch, with no inline error message
// shown on failure yet. A proper fix (showing "rejected: <reason>" etc.)
// needs the tracker's forms converted to client components using
// useActionState, which is a reasonable fast-follow, not done in this pass.

async function refreshAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const res = await fetch(`${API_URL}/api/auth/refresh`, {
    method: "POST",
    headers: { Cookie: cookieHeader },
  });

  const setCookies = res.headers.getSetCookie?.() ?? [];
  for (const cookie of setCookies) {
    const [nameValue] = cookie.split(";");
    const [name, value] = nameValue.split("=");
    if (name && value) cookieStore.set(name, decodeURIComponent(value));
  }

  if (!res.ok) return null;
  try {
    const data = (await res.json()) as { token?: string };
    return data.token ?? null;
  } catch {
    return null;
  }
}

async function postProduction(path: string, body?: unknown): Promise<void> {
  const session = await getServerSession(authOptions);
  let token = session?.user?.backendToken as string | undefined;

  const doFetch = async (bearer?: string) => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (bearer) headers["Authorization"] = `Bearer ${bearer}`;
    return fetch(`${API_URL}${path}`, {
      method: "POST",
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  };

  let res = await doFetch(token);

  if (res.status === 401 || res.status === 403) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      token = newToken;
      res = await doFetch(token);
    }
  }

  // Intentionally swallowing failure detail here -- see file-level note above
  // on why these actions return void. If res is not ok, the UI simply won't
  // show the expected change after revalidation, which is a known gap.
  if (!res.ok) {
    console.error(`[production action] ${path} failed with status ${res.status}`);
  }
}

export async function approveProductionAction(orderId: string): Promise<void> {
  await postProduction(`/api/admin/production/${orderId}/approve`);
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function rejectProductionAction(orderId: string, formData: FormData): Promise<void> {
  const notes = (formData.get("notes") as string) || undefined;
  await postProduction(`/api/admin/production/${orderId}/reject`, { notes });
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function proposeStageAction(orderId: string, formData: FormData): Promise<void> {
  const pendingStage = formData.get("pendingStage") as string;
  const notes = (formData.get("notes") as string) || undefined;
  await postProduction(`/api/employee/production/${orderId}/propose`, { pendingStage, notes });
  revalidatePath(`/employee/orders/${orderId}`);
}