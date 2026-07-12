export function PipelineTable({
  rows,
}: {
  rows: { label: string; count: number; colorVar: string }[];
}) {
  const total = rows.reduce((sum, r) => sum + r.count, 0);

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="font-heading mb-3 text-[15px] font-medium text-foreground">
        Order pipeline
      </p>
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="text-left text-muted-foreground">
            <th className="pb-2 font-normal">Status</th>
            <th className="pb-2 font-normal">Count</th>
            <th className="pb-2 font-normal">Share</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <td className="py-1.5 text-foreground">{row.label}</td>
              <td className="py-1.5 text-foreground">{row.count}</td>
              <td className="py-1.5">
                <div className="h-1.5 w-full rounded-full bg-border">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: total > 0 ? `${(row.count / total) * 100}%` : "0%",
                      backgroundColor: row.colorVar,
                    }}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}