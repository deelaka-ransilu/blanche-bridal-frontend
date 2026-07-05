import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiRequest } from "@/lib/api/client";

// Mirrors lib/api/employees.ts exactly.
//
// UNCONFIRMED SHAPE: assumed to match Employee's {id, firstName, lastName,
// email}. AdminController.listCustomers() -> adminService.listCustomers()
// return type (likely List<UserResponse>) was not seen directly — verify
// against the real UserResponse DTO before trusting field names here.
//
// ACCESS NOTE: /api/admin/customers sits under AdminController's class-level
// @PreAuthorize("hasRole('ADMIN')") -- EMPLOYEE cannot call this. Per
// decision, manual rental creation (which needs this list) is ADMIN-only
// on the frontend as a direct consequence.

export type Customer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export async function getCustomers(): Promise<Customer[]> {
  const session = await getServerSession(authOptions);
  const token = session?.user?.backendToken as string | undefined;

  const result = await apiRequest<Customer[]>("/api/admin/customers", { method: "GET" }, token);
  return result.success ? result.data : [];
}