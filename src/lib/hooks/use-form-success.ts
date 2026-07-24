// src/lib/hooks/use-form-success.ts
"use client";

import { useEffect } from "react";

/** Calls onSuccess once when a useActionState result flips to success —
 * shared by walk-in customer, employee, and category forms (and anywhere
 * else a create-form closes its parent modal on success). */
export function useFormSuccess(
  state: { success: boolean } | null,
  onSuccess?: () => void,
): void {
  useEffect(() => {
    if (state?.success) {
      onSuccess?.();
    }
  }, [state, onSuccess]);
}