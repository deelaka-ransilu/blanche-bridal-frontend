import { getCustomerDetail } from "@/lib/api/auth-server";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const res = await getCustomerDetail(id);

  if (!res.success || !res.data) {
    return (
      <div className="p-8 text-sm text-red-600">
        Failed to load customer:{" "}
        {res.success ? "Not found" : res.message}
      </div>
    );
  }

  const c = res.data;

  return (
    <div className="p-8 space-y-6 max-w-2xl">
      <h1 className="text-2xl font-semibold">
        {c.firstName} {c.lastName}
      </h1>
      <div className="text-sm space-y-1">
        <p>Email: {c.email}</p>
        <p>Phone: {c.phone}</p>
        <p>Status: {c.active ? "Active" : "Inactive"}</p>
        <p>Admin notes: {c.adminNotes ?? "—"}</p>
      </div>

      <h2 className="text-lg font-medium">Measurement History</h2>
      {c.measurements.length === 0 ? (
        <p className="text-sm text-muted-foreground">No measurements recorded yet.</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {c.measurements.map((m) => (
            <li key={m.id} className="border rounded p-3">
              <p className="font-mono text-xs">{m.publicId}</p>
              <p>Recorded: {new Date(m.measuredAt).toLocaleString()}</p>
              {m.notes && <p>Notes: {m.notes}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}