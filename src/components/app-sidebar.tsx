"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DashboardSquare01Icon,
  UserGroupIcon,
  Settings05Icon,
  ShoppingBagIcon,
  Calendar03Icon,
  Package01Icon,
  MessageQuestionIcon,
  Store01Icon,
  RulerIcon,
  UserIcon,
  Crown02Icon,
  ShieldUserIcon,
} from "@hugeicons/core-free-icons";

const navByRole: Record<
  string,
  { title: string; url: string; icon: React.ReactNode }[]
> = {
  SUPERADMIN: [
    {
      title: "Dashboard",
      url: "/superadmin/dashboard",
      icon: <HugeiconsIcon icon={DashboardSquare01Icon} strokeWidth={2} />,
    },
    {
      title: "Manage Admins",
      url: "/superadmin/admins",
      icon: <HugeiconsIcon icon={Crown02Icon} strokeWidth={2} />,
    },
    {
      title: "Manage Employees",
      url: "/superadmin/employees",
      icon: <HugeiconsIcon icon={ShieldUserIcon} strokeWidth={2} />,
    },
    {
      title: "Manage Customers",
      url: "/superadmin/customers",
      icon: <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} />,
    },
    {
      title: "System Settings",
      url: "/superadmin/settings",
      icon: <HugeiconsIcon icon={Settings05Icon} strokeWidth={2} />,
    },
  ],
  ADMIN: [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: <HugeiconsIcon icon={DashboardSquare01Icon} strokeWidth={2} />,
    },
    {
      title: "Manage Employees",
      url: "/admin/employees",
      icon: <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} />,
    },
    {
      title: "Manage Customers",
      url: "/admin/customers",
      icon: <HugeiconsIcon icon={UserIcon} strokeWidth={2} />,
    },
    {
      title: "Appointments",
      url: "/admin/appointments",
      icon: <HugeiconsIcon icon={Calendar03Icon} strokeWidth={2} />,
    },
    {
      title: "Rentals",
      url: "/admin/rentals",
      icon: <HugeiconsIcon icon={Store01Icon} strokeWidth={2} />,
    },
    {
      title: "Orders",
      url: "/admin/orders",
      icon: <HugeiconsIcon icon={Package01Icon} strokeWidth={2} />,
    },
    {
      title: "Inquiries",
      url: "/admin/inquiries",
      icon: <HugeiconsIcon icon={MessageQuestionIcon} strokeWidth={2} />,
    },
  ],
  EMPLOYEE: [
    {
      title: "Dashboard",
      url: "/employee/dashboard",
      icon: <HugeiconsIcon icon={DashboardSquare01Icon} strokeWidth={2} />,
    },
    {
      title: "Appointments",
      url: "/employee/appointments",
      icon: <HugeiconsIcon icon={Calendar03Icon} strokeWidth={2} />,
    },
    {
      title: "Orders",
      url: "/employee/orders",
      icon: <HugeiconsIcon icon={Package01Icon} strokeWidth={2} />,
    },
  ],
  CUSTOMER: [
    {
      title: "Collection",
      url: "/collection",
      icon: <HugeiconsIcon icon={ShoppingBagIcon} strokeWidth={2} />,
    },
    {
      title: "My Appointments",
      url: "/my/appointments",
      icon: <HugeiconsIcon icon={Calendar03Icon} strokeWidth={2} />,
    },
    {
      title: "My Rentals",
      url: "/my/rentals",
      icon: <HugeiconsIcon icon={Store01Icon} strokeWidth={2} />,
    },
    {
      title: "My Orders",
      url: "/my/orders",
      icon: <HugeiconsIcon icon={Package01Icon} strokeWidth={2} />,
    },
    {
      title: "My Measurements",
      url: "/my/measurements",
      icon: <HugeiconsIcon icon={RulerIcon} strokeWidth={2} />,
    },
    {
      title: "My Profile",
      url: "/my/profile",
      icon: <HugeiconsIcon icon={UserIcon} strokeWidth={2} />,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();
  const role = (session?.user?.role as string) ?? "CUSTOMER";
  const navItems = navByRole[role] ?? navByRole.CUSTOMER;

  const user = {
    name:
      [session?.user?.firstName, session?.user?.lastName]
        .filter(Boolean)
        .join(" ") || "User",
    email: session?.user?.email ?? "",
    avatar: "",
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="/">
                <span className="text-base font-semibold tracking-wide">
                  Blanche Bridal
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
        <NavSecondary
          items={[
            {
              title: "Settings",
              url:
                role === "CUSTOMER"
                  ? "/my/profile"
                  : `/${role.toLowerCase()}/settings`,
              icon: <HugeiconsIcon icon={Settings05Icon} strokeWidth={2} />,
            },
          ]}
          className="mt-auto"
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
