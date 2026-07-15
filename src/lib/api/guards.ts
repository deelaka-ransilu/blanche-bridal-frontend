import { redirect } from "next/navigation";

/**
 * Call at the top of a Server Component read, right after awaiting a
 * lib/api/* function. Redirects to /login if the backend rejected the
 * request with 403 (no header, invalid/expired token, or inactive user --
 * see BACKEND_HANDOVER_V2.md "Auth Rejection Behavior", all three collapse
 * to 403).
 *
 * Accepts any of the per-module result types (CustomerListResult,
 * OrderListResult, etc.) without requiring them to formally declare
 * `authError` -- see CURRENT_STATE.md follow-up on tightening those types.
 */
export function redirectIfAuthError(result: { success: boolean; authError?: boolean }) {
  if (!result.success && result.authError) {
    redirect("/login");
  }
}