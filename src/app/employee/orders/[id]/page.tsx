import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getOrderById } from "@/lib/api/orders";
import { getCustomDesignRequestById } from "@/lib/api/custom-design";
import { formatDate, getCustomerName } from "@/lib/utils";
import { OCCASION_TYPE_LABELS } from "@/types/custom-design";
import { OrderDetailHeader } from "@/components/shared/order-detail-header";

export default async function EmployeeOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getOrderById(id);

  if (!result.success) {
    notFound();
  }

  const order = result.data;
  const customDesignRequest = order.customDesignRequestId
    ? await getCustomDesignRequestById(order.customDesignRequestId)
    : null;

  const customerName = getCustomerName(order);

  return (
    <div>
      <OrderDetailHeader
        backHref="/employee/orders"
        backLabel="Orders"
        title={`Order #${order.id.slice(0, 8).toUpperCase()}`}
        customerName={customerName}
        createdAt={order.createdAt}
      />

      {customDesignRequest?.success ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
          {/* Consultation details card */}
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="font-heading mb-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Consultation
            </p>
            <div className="space-y-1.5 text-[13px]">
              <div>
                <span className="text-muted-foreground">Occasion: </span>
                <span className="font-medium text-foreground">
                  {OCCASION_TYPE_LABELS[customDesignRequest.data.occasionType]}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Slot: </span>
                <span className="font-medium text-foreground">
                  {customDesignRequest.data.timeSlot}
                </span>
              </div>
              {customDesignRequest.data.stylePreferences && (
                <div>
                  <span className="text-muted-foreground">Style: </span>
                  <span className="text-foreground">{customDesignRequest.data.stylePreferences}</span>
                </div>
              )}
              {customDesignRequest.data.appointmentNotes && (
                <div>
                  <span className="text-muted-foreground">Notes: </span>
                  <span className="text-foreground">{customDesignRequest.data.appointmentNotes}</span>
                </div>
              )}
            </div>
          </div>

          {/* Reference images card */}
          {customDesignRequest.data.referenceImages.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="font-heading mb-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Reference Images
              </p>
              <div className="flex flex-col gap-3">
                {customDesignRequest.data.referenceImages.map((url) => (
                  <a key={url} href={url} target="_blank" rel="noopener noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element -- Cloudinary URL */}
                    <img
                      src={url}
                      alt="Reference"
                      className="w-full aspect-square rounded-lg border border-border object-cover transition-opacity hover:opacity-80"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border p-4">
          <p className="text-sm text-muted-foreground">
            No consultation details for this order.
          </p>
        </div>
      )}
    </div>
  );
}