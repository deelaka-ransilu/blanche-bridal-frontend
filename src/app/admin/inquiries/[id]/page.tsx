import { getInquiryById } from "@/lib/api/inquiries";
import { InquiryStatusForm } from "@/components/inquiries/inquiry-status-form";
import { InquiryReplyForm } from "@/components/inquiries/inquiry-reply-form";
import { formatDate } from "@/lib/utils";
import { notFound } from "next/navigation";
import { redirectIfAuthError } from "@/lib/api/guards";

export default async function AdminInquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getInquiryById(id);

  redirectIfAuthError(result);
  if (!result.success) notFound();
  const inquiry = result.data;

  return (
    <div className="mx-auto max-w-2xl p-4">
      <h1 className="text-xl font-semibold">{inquiry.subject || "General Inquiry"}</h1>
      <p className="mt-1 text-sm text-gray-500">
        {inquiry.name} · {inquiry.email} {inquiry.phone && `· ${inquiry.phone}`}
      </p>
      <p className="mt-1 text-xs text-gray-400">{formatDate(inquiry.createdAt)}</p>

      <div className="mt-6 rounded border border-gray-200 p-4">
        <p className="text-gray-700">{inquiry.message}</p>
        {inquiry.imageUrl && (
          <img src={inquiry.imageUrl} alt="Attached reference" className="mt-3 max-w-xs rounded" />
        )}
      </div>

      <div className="mt-6">
        <InquiryStatusForm id={inquiry.id} currentStatus={inquiry.status} />
      </div>

      <div className="mt-8">
        <h2 className="mb-2 text-sm font-medium text-gray-700">Reply</h2>
        <p className="mb-3 text-xs text-gray-400">
          Reply is emailed directly to the customer and not stored — this app won't show past replies.
        </p>
        <InquiryReplyForm id={inquiry.id} />
      </div>
    </div>
  );
}