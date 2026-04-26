"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ProfileForm } from "@/features/users/components/ProfileForm";

export default function CustomerProfilePage() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-6 gap-6">
          <div>
            <h2 className="text-xl font-semibold">My Profile</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your personal information and view your measurements.
            </p>
          </div>
          <ProfileForm />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
