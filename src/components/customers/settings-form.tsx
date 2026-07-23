"use client";

import { useActionState, useState } from "react";
import { updateMyProfileAction, type ProfileFormState } from "@/lib/actions/customers";
import { Button } from "@/components/ui/button";
import type { AdminUser } from "@/types/user";

interface SettingsFormProps {
  profile: AdminUser;
}

const initialState: ProfileFormState = null;

// Sri Lankan mobile numbers: 10 digits, starting with 07 — same rule used
// on the checkout page, kept in sync so a profile phone number that passes
// here will also pass there.
const PHONE_REGEX = /^07\d{8}$/;

export default function SettingsForm({ profile }: SettingsFormProps) {
  const [state, formAction, isPending] = useActionState(updateMyProfileAction, initialState);
  const [phone, setPhone] = useState(profile.phone ?? "");

  // Only show a format error once there's actually something typed — an
  // empty field isn't wrong, it's just optional/unset.
  const phoneError =
    phone.length > 0 && !PHONE_REGEX.test(phone)
      ? "Enter a valid number, e.g. 07XXXXXXXX"
      : null;

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
          type="tel"
          inputMode="numeric"
          name="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
          placeholder="07XXXXXXXX"
          maxLength={10}
          className="mt-1.5 w-full rounded-xl border border-border bg-background p-2.5 text-sm text-foreground transition focus:border-primary focus:outline-none"
        />
        {phoneError && <p className="mt-1 text-xs text-destructive">{phoneError}</p>}
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
          disabled={isPending || Boolean(phoneError)}
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