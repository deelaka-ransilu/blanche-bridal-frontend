import { getInquiries } from "@/lib/api/inquiries";
import { INQUIRY_STATUS_LABEL } from "@/types/inquiry";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export async function InquiriesView() {
  const result = await getInquiries();

  if (!result.success) {
    return <p className="text-sm text-destructive">{result.message}</p>;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-primary/5 text-left">
          <tr>
            <th className="p-3 text-foreground">Name</th>
            <th className="p-3 text-foreground">Subject</th>
            <th className="p-3 text-foreground">Status</th>
            <th className="p-3 text-foreground">Date</th>
            <th className="p-3" />
          </tr>
        </thead>
        <tbody>
          {result.data.map((inquiry) => (
            <tr key={inquiry.id} className="border-t border-border">
              <td className="p-3 text-foreground">{inquiry.name}</td>
              <td className="p-3 text-muted-foreground">{inquiry.subject || "—"}</td>
              <td className="p-3 text-muted-foreground">
                {INQUIRY_STATUS_LABEL[inquiry.status]}
              </td>
              <td className="p-3 text-muted-foreground">{formatDate(inquiry.createdAt)}</td>
              <td className="p-3">
                <Link href={`/admin/inquiries/${inquiry.id}`} className="text-primary hover:underline">
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {result.data.length === 0 && (
        <p className="p-3 text-sm text-muted-foreground">No inquiries yet.</p>
      )}
    </div>
  );
}