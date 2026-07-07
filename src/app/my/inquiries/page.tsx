import { getMyInquiries } from "@/lib/api/inquiries";
import { INQUIRY_STATUS_LABEL } from "@/types/inquiry";
import { formatDate } from "@/lib/utils"; // adjust to your actual helper location

export default async function MyInquiriesPage() {
  const result = await getMyInquiries();

  if (!result.success) {
    return <p className="p-4 text-red-600">{result.message}</p>;
  }

  const inquiries = result.data;

  if (inquiries.length === 0) {
    return <p className="p-4 text-gray-500">You haven't sent any inquiries yet.</p>;
  }

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-semibold">My Inquiries</h1>
      {inquiries.map((inquiry) => (
        <div key={inquiry.id} className="rounded border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">{inquiry.subject || "General Inquiry"}</span>
            <span className="text-sm text-gray-500">{INQUIRY_STATUS_LABEL[inquiry.status]}</span>
          </div>
          <p className="mt-1 text-sm text-gray-600">{inquiry.message}</p>
          <p className="mt-2 text-xs text-gray-400">{formatDate(inquiry.createdAt)}</p>
        </div>
      ))}
    </div>
  );
}