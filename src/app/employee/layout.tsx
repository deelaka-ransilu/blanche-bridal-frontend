import RoleDashboardLayout from "@/components/layouts/RoleDashboardLayout";

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return <RoleDashboardLayout>{children}</RoleDashboardLayout>;
}