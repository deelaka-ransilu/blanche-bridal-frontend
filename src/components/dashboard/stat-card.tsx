export function StatCard({
  label,
  value,
  variant = "light",
}: {
  label: string;
  value: string;
  variant?: "light" | "dark";
}) {
  if (variant === "dark") {
    return (
      <div className="rounded-xl bg-white/10 p-3">
        <p className="mb-1.5 text-[11px] text-[#c9c7c2]">{label}</p>
        <p className="text-xl font-medium text-white">{value}</p>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <p className="mb-1.5 text-[11px] text-muted-foreground">{label}</p>
      <p className="text-xl font-medium text-foreground">{value}</p>
    </div>
  );
}