"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getMyInquiries } from "@/lib/api/inquiries";
import { type InquiryResponse, type InquiryStatus } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Clock, MessageCircle, PlusCircle, Inbox } from "lucide-react";

const STATUS_LABEL: Record<InquiryStatus, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
};

const STATUS_VARIANT: Record<InquiryStatus, "default" | "secondary" | "outline"> = {
  OPEN: "default",
  IN_PROGRESS: "secondary",
  RESOLVED: "outline",
};

export default function MyInquiriesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [inquiries, setInquiries] = useState<InquiryResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait for session to finish loading
    if (status === "loading") return;

    const token = session?.user?.backendToken;

    if (!token) {
      // Session loaded but no token — stop the skeleton
      setLoading(false);
      return;
    }

    getMyInquiries(token)
      .then((res) => {
        if (res.success && res.data) setInquiries(res.data);
      })
      .catch(() => {
        // silently fail — show empty state
      })
      .finally(() => setLoading(false)); // always stop the skeleton
  }, [session, status]);

  if (loading) {
    return (
      <div className="p-6 space-y-3 max-w-2xl">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">My Inquiries</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {inquiries.length} {inquiries.length === 1 ? "inquiry" : "inquiries"} submitted
          </p>
        </div>
        <Button onClick={() => router.push("/inquiry")}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Inquiry
        </Button>
      </div>

      <Separator />

      {inquiries.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto">
            <Inbox className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="font-medium">No inquiries yet</p>
          <p className="text-sm text-muted-foreground">
            Have a question? Send us a message and we'll get back to you.
          </p>
          <Button variant="outline" onClick={() => router.push("/inquiry")}>
            Submit an Inquiry
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inquiry) => (
            <div key={inquiry.id} className="rounded-xl border bg-card p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                  <p className="font-medium text-sm">
                    {inquiry.subject ?? "General Inquiry"}
                  </p>
                </div>
                <Badge variant={STATUS_VARIANT[inquiry.status]}>
                  {STATUS_LABEL[inquiry.status]}
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed pl-6">
                {inquiry.message}
              </p>

              <div className="flex items-center gap-1.5 pl-6 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {new Date(inquiry.createdAt).toLocaleString("en-LK", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}