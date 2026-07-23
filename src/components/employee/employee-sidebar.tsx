"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, Menu, X } from "lucide-react";
import { useState } from "react";
import { SignOutButton } from "@/components/ui/sign-out-button";
import { ThemeToggle } from "@/components/theme-toggle";

const links = [
  { href: "/employee/orders", label: "Orders", icon: Package },
];