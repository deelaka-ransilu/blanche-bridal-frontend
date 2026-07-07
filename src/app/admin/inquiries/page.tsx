import { getInquiries } from "@/lib/api/inquiries";
import { INQUIRY_STATUS_LABEL } from "@/types/inquiry";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default async function AdminInquiriesPage() {
  const result = await getInquiries();

  if (!result.success) {
    return <p className="p-4 text-red-600">{result.message}</p>;
  }

  return (
    <div className="p-4">
      <h1 className="mb-4 text-xl font-semibold">Inquiries</h1>
      <div className="overflow-hidden rounded border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Subject</th>
              <th className="p-3">Status</th>
              <th className="p-3">Date</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {result.data.map((inquiry) => (
              <tr key={inquiry.id} className="border-t border-gray-100">
                <td className="p-3">{inquiry.name}</td>
                <td className="p-3">{inquiry.subject || "—"}</td>
                <td className="p-3">{INQUIRY_STATUS_LABEL[inquiry.status]}</td>
                <td className="p-3">{formatDate(inquiry.createdAt)}</td>
                <td className="p-3">
                  <Link href={`/admin/inquiries/${inquiry.id}`} className="text-brand-600 hover:underline">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}