import { requireRole } from "@/lib/auth-guard";
import { getMyProfile, getMyMeasurements } from "@/lib/api/customers";
import SettingsForm from "@/components/customers/settings-form";
import { SettingsTabs } from "@/components/customers/settings-tabs";

export default async function MySettingsPage() {
  await requireRole("CUSTOMER");

  const [profileResult, measurementsResult] = await Promise.all([
    getMyProfile(),
    getMyMeasurements(),
  ]);

  if (!profileResult.success) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        {profileResult.message}
      </div>
    );
  }

  const measurements = measurementsResult.success ? measurementsResult.data : [];

  // Google-authenticated users get a placeholder phone value ("google_<id>")
  // to satisfy the DB's NOT NULL/UNIQUE constraint on registration.
  // Strip it out here so the UI never shows it as a real phone number.
  const profile = profileResult.data;
  const cleanedProfile = {
    ...profile,
    phone: profile.phone?.startsWith("google_") ? "" : profile.phone,
  };

  return (
    <div className="mx-auto max-w-xl">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground text-center">
        Account
      </p>
      <h1 className="font-heading mt-1 text-2xl font-medium text-foreground sm:text-3xl text-center">
        Settings
      </h1>

      <div className="mt-6">
        <SettingsTabs
          profileContent={
            <>
              <p className="mb-4 text-sm text-muted-foreground text-center">
                Update your name, phone, and address. Email and password
                changes aren&apos;t available here yet — reach out to us
                directly if you need to update either.
              </p>
              <SettingsForm profile={cleanedProfile} />
            </>
          }
          measurements={measurements}
        />
      </div>
    </div>
  );
}