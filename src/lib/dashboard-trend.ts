// Computes "this month vs last month" % change from monthly report arrays.
// Assumes items are ordered oldest -> newest (matches backend report shape).
// Returns undefined when there isn't enough data to compare (< 2 months),
// so StatCard can just omit the trend rather than show a misleading 0%.

export function computeTrend(
  values: number[],
): { value: string; direction: "up" | "down" } | undefined {
  if (values.length < 2) return undefined;

  const current = values[values.length - 1];
  const previous = values[values.length - 2];

  if (previous === 0) {
    // Avoid divide-by-zero; only show trend if there's actually a change to report.
    if (current === 0) return undefined;
    return { value: "New", direction: "up" };
  }

  const pctChange = ((current - previous) / previous) * 100;
  const direction = pctChange >= 0 ? "up" : "down";
  const value = `${Math.abs(pctChange).toFixed(1)}%`;

  return { value, direction };
}