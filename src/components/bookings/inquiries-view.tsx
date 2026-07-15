import { Inbox } from "lucide-react";
import { getInquiries } from "@/lib/api/inquiries";
import { InquiriesListClient } from "@/components/bookings/inquiries-list-client";

export async function InquiriesView() {
  const result = await getInquiries();

  if (!result.success) {
    return <p className="text-sm text-destructive">{result.message}</p>;
  }

  if (result.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-border py-16 text-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/5 text-muted-foreground">
          <Inbox className="h-5 w-5" />
        </div>
        <p className="text-sm text-muted-foreground">No inquiries yet.</p>
      </div>
    );
  }

  return <InquiriesListClient inquiries={result.data} />;
}