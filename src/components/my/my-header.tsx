// components/my/my-header.tsx
import { SignOutButton } from "@/components/ui/sign-out-button";
import { ThemeToggle } from "@/components/theme-toggle";

export function MyHeader({ firstName }: { firstName: string }) {
  const initial = firstName.charAt(0).toUpperCase();

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="mb-0.5 text-[13px] tracking-wide text-muted-foreground">Welcome back</p>
          <h1 className="font-heading text-2xl font-medium text-foreground">Hi, {firstName}</h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
            {initial}
          </div>
          <SignOutButton />
        </div>
      </div>
      <div className="mt-4 h-px w-full bg-gradient-to-r from-primary/40 via-primary/10 to-transparent" />
    </div>
  );
}