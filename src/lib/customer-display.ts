import type { AdminUser } from "@/types/user";

const OAUTH_PLACEHOLDER_EMAIL = /^(google|facebook)_\d+$/i;

export function displayCustomerContact(c: AdminUser): string {
  if (c.phone) return c.phone;
  if (c.email && !OAUTH_PLACEHOLDER_EMAIL.test(c.email)) return c.email;
  return "No contact on file";
}