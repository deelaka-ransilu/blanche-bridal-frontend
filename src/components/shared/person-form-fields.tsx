// src/components/shared/person-form-fields.tsx
"use client";

export function PersonFormFields({ children }: { children?: React.ReactNode }) {
  return (
    <>
      <input
        name="firstName"
        placeholder="First name"
        required
        className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
      />
      <input
        name="lastName"
        placeholder="Last name"
        required
        className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
      />
      <input
        name="email"
        type="email"
        placeholder="Email"
        required
        className="col-span-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
      />
      {/* Extra fields (e.g. employee password) render here, between email and phone */}
      {children}
      <input
        name="phone"
        placeholder="Phone (optional)"
        className="col-span-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
      />
    </>
  );
}