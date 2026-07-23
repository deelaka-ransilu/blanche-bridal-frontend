"use client";

import { Search, UserPlus, Loader2 } from "lucide-react";
import type { AdminUser } from "@/types/user";
import type { WalkInCustomerFormState } from "@/lib/actions/customers";

interface CustomerStepProps {
  customersLoading: boolean;
  customersError: string | null;
  customerSearch: string;
  setCustomerSearch: (v: string) => void;
  filteredCustomers: AdminUser[];
  customers: AdminUser[];
  selectedCustomer: AdminUser | null;
  setSelectedCustomer: (c: AdminUser | null) => void;
  showNewCustomerForm: boolean;
  setShowNewCustomerForm: (v: boolean) => void;
  newCustomerState: WalkInCustomerFormState;
  newCustomerFormAction: (formData: FormData) => void;
}

export function CustomerStep({
  customersLoading,
  customersError,
  customerSearch,
  setCustomerSearch,
  filteredCustomers,
  customers,
  selectedCustomer,
  setSelectedCustomer,
  showNewCustomerForm,
  setShowNewCustomerForm,
  newCustomerState,
  newCustomerFormAction,
}: CustomerStepProps) {
  return (
    <div className="flex flex-col gap-4">
      {!showNewCustomerForm && (
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={customerSearch}
            onChange={(e) => setCustomerSearch(e.target.value)}
            placeholder="Search by name or phone..."
            className="w-full rounded-lg border border-border bg-transparent py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>
      )}

      {!showNewCustomerForm && (
        <div className="flex flex-col gap-1.5">
          {customersLoading && (
            <div className="flex items-center justify-center gap-2 py-6 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Loading customers...
            </div>
          )}

          {!customersLoading && customersError && (
            <p className="py-2 text-center text-xs text-destructive">{customersError}</p>
          )}

          {!customersLoading &&
            !customersError &&
            filteredCustomers.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCustomer(c)}
                className={`flex items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-colors ${
                  selectedCustomer?.id === c.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40"
                }`}
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {c.firstName} {c.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">{c.phone ?? c.email}</p>
                </div>
                {selectedCustomer?.id === c.id && (
                  <span className="text-[11px] font-medium text-primary">Selected</span>
                )}
              </button>
            ))}

          {!customersLoading && !customersError && filteredCustomers.length === 0 && customerSearch && (
            <p className="py-2 text-center text-xs text-muted-foreground">
              No matches for &quot;{customerSearch}&quot;
            </p>
          )}

          {!customersLoading && !customersError && customers.length === 0 && !customerSearch && (
            <p className="py-2 text-center text-xs text-muted-foreground">No customers yet.</p>
          )}

          <button
            onClick={() => {
              setShowNewCustomerForm(true);
              setSelectedCustomer(null);
            }}
            className="mt-1 flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-2.5 text-xs font-medium text-primary hover:bg-primary/5"
          >
            <UserPlus className="h-3.5 w-3.5" />
            New customer
          </button>
        </div>
      )}

      {showNewCustomerForm && (
        <form action={newCustomerFormAction} className="flex flex-col gap-3 rounded-lg border border-border p-3.5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-foreground">New customer</p>
            <button
              type="button"
              onClick={() => setShowNewCustomerForm(false)}
              className="text-[11px] text-muted-foreground hover:text-foreground"
            >
              Search instead
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              name="firstName"
              placeholder="First name"
              required
              className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
            <input
              name="lastName"
              placeholder="Last name"
              required
              className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>
          <input
            name="phone"
            placeholder="Phone"
            className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />

          {newCustomerState && !newCustomerState.success && (
            <p className="text-xs text-destructive">{newCustomerState.message}</p>
          )}

          <button
            type="submit"
            className="rounded-lg bg-primary py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"
          >
            Add customer
          </button>
        </form>
      )}
    </div>
  );
}
