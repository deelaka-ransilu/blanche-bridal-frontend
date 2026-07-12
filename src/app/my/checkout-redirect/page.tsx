"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Exists only because /login's callbackUrl guard is intentionally strict
// (only honors /my, /admin, /employee prefixes -- see LoginForm's
// isCustomerRoute/isAdminRoute/isEmployeeRoute check). /cart doesn't match
// that prefix, so unauthenticated checkout attempts send users here first
// (?callbackUrl=/my/checkout-redirect), which the guard accepts, and this
// page immediately bounces them on to /cart. Cart state is untouched --
// it lives in localStorage via CartProvider, not tied to auth state.
export default function CheckoutRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/cart");
  }, [router]);

  return null;
}