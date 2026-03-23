"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authStore } from "@/store/auth.store";

type Role = "ADMIN" | "EMPLOYEE" | "CUSTOMER";

export function useRequireAuth(allowedRoles?: Role[]) {
  const router = useRouter();

  useEffect(() => {
    if (!authStore.isLoggedIn()) {
      router.push("/auth/login");
      return;
    }

    if (allowedRoles && allowedRoles.length > 0) {
      const user = authStore.getUser();
      if (!user || !allowedRoles.includes(user.role)) {
        // Redirect to the right place based on actual role
        if (user?.role === "EMPLOYEE") {
          router.push("/employee");
        } else if (user?.role === "CUSTOMER") {
          router.push("/");
        } else {
          router.push("/auth/login");
        }
      }
    }
  }, []);
}
