export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F8F4E3]">
      {/* Navbar will go here in Phase 3 */}
      <main>{children}</main>
      {/* Footer will go here in Phase 3 */}
    </div>
  );
}
