"use client";

import { useState } from "react";
import { Search, Bell, ChevronDown } from "lucide-react";
import Link from "next/link";
import { SignOutButton } from "@/components/ui/sign-out-button";

export function AdminTopbar({ userName }: { userName: string }) {
  return (
    <div className="mb-6">
      <p className="mb-0.5 text-[13px] text-muted-foreground">Welcome back</p>
      <h1 className="font-heading text-xl font-medium text-foreground">Hi, {userName}</h1>
    </div>
  );
}