"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { ArrowLeft, Loader2, User } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminApiError, createWalkInCustomer } from "@/lib/api/customers";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-medium tracking-[0.06em] uppercase text-muted-foreground mb-2.5">
      {children}
    </p>
  );
}

export default function NewWalkInCustomerPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const token = session?.user?.backendToken ?? "";

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  async function handleAuthError() {
    await signOut({ callbackUrl: "/login" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast.error("First name and last name are required");
      return;
    }

    setLoading(true);

    try {
      const customer = await createWalkInCustomer(token, {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
      });

      toast.success("Walk-in customer created successfully");
      router.push(`/admin/customers/${customer.id}`);
    } catch (error) {
      if (error instanceof AdminApiError && (error.status === 401 || error.status === 403)) {
        await handleAuthError();
        return;
      }

      const message = error instanceof Error ? error.message : "Failed to create customer";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-4 sm:p-6">
      {/* Header */}
      <div className="space-y-4">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to customers
        </button>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="bg-muted/60 rounded-lg p-2.5">
              <User className="size-5 text-muted-foreground" />
            </div>
            <div>
              <h1 className="text-[20px] font-semibold tracking-tight text-foreground">Create Walk-in Customer</h1>
              <p className="text-[13px] text-muted-foreground">Register a new walk-in customer not yet in the system</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
        <div className="px-4 py-3.5 border-b border-border/50">
          <SectionLabel>Customer Details</SectionLabel>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-foreground" htmlFor="firstName">
                First Name *
              </label>
              <Input
                id="firstName"
                placeholder="John"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                disabled={loading}
                className="rounded-lg h-9 text-[13px]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-foreground" htmlFor="lastName">
                Last Name *
              </label>
              <Input
                id="lastName"
                placeholder="Doe"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                disabled={loading}
                className="rounded-lg h-9 text-[13px]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-foreground" htmlFor="email">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              disabled={loading}
              className="rounded-lg h-9 text-[13px]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-foreground" htmlFor="phone">
              Phone
            </label>
            <Input
              id="phone"
              placeholder="+94 123 456 7890"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              disabled={loading}
              className="rounded-lg h-9 text-[13px]"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={loading}
              className="gap-2 text-[13px] h-9 rounded-lg"
            >
              {loading && <Loader2 className="size-4 animate-spin" />}
              {loading ? "Creating..." : "Create Customer"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
              className="text-[13px] h-9 rounded-lg"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
