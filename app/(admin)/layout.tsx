export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F8F4E3]">
      {/* Admin sidebar will go here in Phase 4 */}
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
