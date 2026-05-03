"use client";

import { ProfileForm } from "@/features/users/components/ProfileForm";

export default function SuperadminSettingsPage() {
  return (
        <div className="flex flex-1 flex-col p-6 gap-6">
          <div>
            <h2 className="text-xl font-semibold">Profile & Settings</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your account information.
            </p>
          </div>
          <ProfileForm />
        </div>
  );
}
