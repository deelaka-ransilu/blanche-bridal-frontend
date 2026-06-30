"use server";

/**
 * features/users/actions/profile-actions.ts
 *
 * Server Actions for profile + measurements. These run server-side, so they
 * can safely call lib/api/auth-server.ts (which needs next/headers via
 * lib/api/server.ts) — the token never has to live in the browser at all,
 * which is the actual fix here, not just a workaround for the build error.
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getProfile,
  updateProfile,
  getMyMeasurements,
} from "@/lib/api/auth-server";
import { SessionExpiredError } from "@/lib/api/server";
import type { User, Measurements } from "@/types";
import type { ApiResponse } from "@/lib/api/client";

async function requireToken(): Promise<string> {
  const session = await getServerSession(authOptions);
  const token = session?.user?.backendToken;
  if (!token) throw new SessionExpiredError();
  return token;
}

export async function fetchProfileAction(): Promise<{
  profile: ApiResponse<User>;
  measurements: ApiResponse<Measurements[]> | null;
}> {
  const session = await getServerSession(authOptions);
  const token = session?.user?.backendToken;
  if (!token) throw new SessionExpiredError();

  const profile = await getProfile(token);

  // Measurements only matter for CUSTOMER role — skip the extra call otherwise.
  const measurements =
    session.user.role === "CUSTOMER" ? await getMyMeasurements(token) : null;

  return { profile, measurements };
}

export async function fetchMyMeasurementsAction(): Promise<
  ApiResponse<Measurements[]>
> {
  const token = await requireToken();
  return getMyMeasurements(token);
}

export async function updateProfileAction(values: {
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
}): Promise<ApiResponse<User>> {
  const token = await requireToken();
  return updateProfile(token, values);
}