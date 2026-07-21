import { Clock } from "lucide-react";

function relativeDayLabel(iso: string): string | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(iso + "T00:00:00");
  const diffDays = Math.round((target.getTime() - today.getTime()) / 86400000);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  return null;
}

export function FittingAppointmentCard({
  date,
  timeSlot,
}: {
  date: string; // "YYYY-MM-DD"
  timeSlot: string;
}) {
  const d = new Date(date + "T00:00:00");
  const month = d.toLocaleDateString("en-LK", { month: "short" }).toUpperCase();
  const day = d.getDate();
  const relative = relativeDayLabel(date);

  return (
    <div className="flex items-center gap-4 rounded-xl border-l-4 border-primary bg-card p-4">
      <div className="flex flex-col items-center leading-none">
        <span className="text-[11px] font-medium tracking-wide text-muted-foreground">
          {month}
        </span>
        <span className="mt-0.5 text-2xl font-semibold text-foreground">{day}</span>
      </div>
      <div>
        {relative && (
          <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
            {relative}
          </p>
        )}
        <p className="text-sm font-medium text-foreground">Dress fitting</p>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" /> {timeSlot}
        </p>
      </div>
    </div>
  );
}