"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SignOutButton({
  variant = "button",
}: {
  // "button": original standalone look, for any other call site that might
  // already use this component elsewhere. "menu": compact row with icon,
  // for dropdown/menu contexts like AdminTopnav's user menu.
  variant?: "button" | "menu";
}) {
  if (variant === "menu") {
    return (
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-[13px] font-medium text-status-cancelled transition-colors hover:bg-status-cancelled/10"
      >
        <LogOut className="h-3.5 w-3.5" />
        Sign out
      </button>
    );
  }

  return (
    <Button variant="outline" onClick={() => signOut({ callbackUrl: "/login" })}>
      Sign out
    </Button>
  );
}