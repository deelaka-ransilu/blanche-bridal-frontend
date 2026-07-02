export function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <p className="mb-1.5 text-[11px] text-muted-foreground">{label}</p>
      <p className="text-xl font-medium text-foreground">{value}</p>
    </div>
  );
}