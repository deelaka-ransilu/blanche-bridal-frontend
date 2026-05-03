import RoleDashboardLayout from "@/components/layouts/RoleDashboardLayout";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <RoleDashboardLayout>{children}</RoleDashboardLayout>;
}