import RoleDashboardLayout from "@/components/layouts/RoleDashboardLayout";

export default function SuperadminLayout({ children }: { children: React.ReactNode }) {
  return <RoleDashboardLayout>{children}</RoleDashboardLayout>;
}