import { requireRole } from "@/lib/auth-guard";
import { getMyProfile } from "@/lib/api/customers";
import SettingsForm from "@/components/customers/settings-form";

export default async function MySettingsPage() {
  await requireRole("CUSTOMER");

  const result = await getMyProfile();

  if (!result.success) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        {result.message}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground text-center">
        Account
      </p>
      <h1 className="font-heading mt-1 text-2xl font-medium text-foreground sm:text-3xl text-center">
        Settings
      </h1>
      <p className="mt-2 text-sm text-muted-foreground text-center">
        Update your name, phone, and address. Email and password changes
        aren&apos;t available here yet — reach out to us directly if you need
        to update either.
      </p>

      <div className="mt-6">
        <SettingsForm profile={result.data} />
      </div>
    </div>
  );
}