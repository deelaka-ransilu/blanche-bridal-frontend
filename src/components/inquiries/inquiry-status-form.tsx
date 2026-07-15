import { updateInquiryStatusAction } from "@/lib/actions/inquiries";
import { Button } from "@/components/ui/button";
import { InquiryStatus } from "@/types/inquiry";

export function InquiryStatusForm({ id, currentStatus }: { id: string; currentStatus: InquiryStatus }) {
  return (
    <form action={updateInquiryStatusAction.bind(null, id)} className="flex items-center gap-2">
      <select
        name="status"
        defaultValue={currentStatus}
        className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
      >
        <option value="OPEN">Open</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="RESOLVED">Resolved</option>
      </select>
      <Button type="submit" size="sm">
        Save
      </Button>
    </form>
  );
}