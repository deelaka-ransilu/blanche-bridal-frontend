export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F8F4E3]">
      {/* Customer nav will go here in Phase 3 */}
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
