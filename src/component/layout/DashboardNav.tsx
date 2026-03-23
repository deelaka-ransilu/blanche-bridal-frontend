"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { User } from "@/types/auth";
import { authStore } from "@/store/auth.store";

interface NavLink {
  label: string;
  href: string;
}

interface DashboardNavProps {
  links: NavLink[];
}

export default function DashboardNav({ links }: DashboardNavProps) {
  const { logout } = useAuth();
  const [user, setUser] = useState<User | null>(null);

  // Only read localStorage after component mounts on client
  useEffect(() => {
    setUser(authStore.getUser());
  }, []);

  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <span className="text-white font-semibold text-lg">Blanche Bridal</span>
        <div className="flex items-center gap-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-gray-400 hover:text-white transition"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-4">
        {user && (
          <span className="text-sm text-gray-400">
            {user.fullName}
            {" — "}
            <span className="text-gray-500">{user.role}</span>
          </span>
        )}
        <button
          onClick={logout}
          className="text-sm bg-red-900/40 hover:bg-red-900/70 border border-red-800 text-red-300 px-3 py-1.5 rounded-lg transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
