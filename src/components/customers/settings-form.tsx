"use client";

import { useActionState } from "react";
import { updateMyProfileAction, type ProfileFormState } from "@/lib/actions/customers";
import { Button } from "@/components/ui/button";
import type { AdminUser } from "@/types/user";

interface SettingsFormProps {
  profile: AdminUser;
}

const initialState: ProfileFormState = null;

export default function SettingsForm({ profile }: SettingsFormProps) {
  const [state, formAction, isPending] = useActionState(updateMyProfileAction, initialState);

  return (
    <form action={formAction} className="rounded-3xl border border-border bg-card p-6 sm:p-8">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            First name
          </label>
          <input
            type="text"
            name="firstName"
            defaultValue={profile.firstName}
            className="mt-1.5 w-full rounded-xl border border-border bg-background p-2.5 text-sm text-foreground transition focus:border-primary focus:outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Last name
          </label>
          <input
            type="text"
            name="lastName"
            defaultValue={profile.lastName}
            className="mt-1.5 w-full rounded-xl border border-border bg-background p-2.5 text-sm text-foreground transition focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-5">
        <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Phone
        </label>
        <input
          type="text"
          name="phone"
          defaultValue={profile.phone ?? ""}
          className="mt-1.5 w-full rounded-xl border border-border bg-background p-2.5 text-sm text-foreground transition focus:border-primary focus:outline-none"
        />
      </div>

      <div className="mt-5">
        <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Address
        </label>
        <textarea
          name="address"
          defaultValue={profile.address ?? ""}
          rows={3}
          className="mt-1.5 w-full resize-none rounded-xl border border-border bg-background p-2.5 text-sm text-foreground transition focus:border-primary focus:outline-none"
        />
      </div>

      <div className="mt-6 flex items-center gap-4">
        <Button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
        >
          {isPending ? "Saving..." : "Save changes"}
        </Button>
        {state?.success && (
          <span className="text-xs font-medium text-status-completed">{state.message}</span>
        )}
        {state && !state.success && (
          <span className="text-xs font-medium text-status-cancelled">{state.message}</span>
        )}
      </div>
    </form>
  );
}