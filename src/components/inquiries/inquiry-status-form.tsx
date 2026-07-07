import { updateInquiryStatusAction } from "@/lib/actions/inquiries";
import { InquiryStatus } from "@/types/inquiry";

export function InquiryStatusForm({ id, currentStatus }: { id: string; currentStatus: InquiryStatus }) {
  return (
    <form action={updateInquiryStatusAction.bind(null, id)} className="flex items-center gap-2">
      <select
        name="status"
        defaultValue={currentStatus}
        className="rounded border border-gray-300 px-3 py-1.5 text-sm"
      >
        <option value="OPEN">Open</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="RESOLVED">Resolved</option>
      </select>
      <button
        type="submit"
        className="rounded bg-brand-600 px-3 py-1.5 text-sm text-white hover:bg-brand-700"
      >
        Save
      </button>
    </form>
  );
}