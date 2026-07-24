// src/lib/hooks/use-refresh-on-success.ts
"use client";

import { useEffect } from "react";
import type { useRouter } from "next/navigation";

/** Calls router.refresh() once when a useActionState result flips to
 * success — shared by payment-confirmation buttons that need the server
 * component tree to re-fetch after a mutation (e.g. order status). */
export function useRefreshOnSuccess(
  success: boolean | undefined,
  router: ReturnType<typeof useRouter>,
): void {
  useEffect(() => {
    if (success) router.refresh();
  }, [success, router]);
}