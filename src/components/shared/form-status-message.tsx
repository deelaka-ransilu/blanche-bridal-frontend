// src/components/shared/form-status-message.tsx
"use client";

export function FormStatusMessage({
  state,
}: {
  state: { success: boolean; message?: string } | null;
}) {
  if (!state || !state.message) return null;
  return state.success ? (
    <p className="text-sm text-status-completed">{state.message}</p>
  ) : (
    <p className="text-sm text-destructive">{state.message}</p>
  );
}