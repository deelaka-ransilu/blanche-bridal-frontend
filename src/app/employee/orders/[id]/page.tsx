import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Ruler } from "lucide-react";
import { getOrderById } from "@/lib/api/orders/orders";
import { getCustomDesignRequestById } from "@/lib/api/production/custom-design";
import { getCustomerMeasurements } from "@/lib/api/people/customers";
import { formatDate, getCustomerName } from "@/lib/utils";
import { OCCASION_TYPE_LABELS } from "@/types/custom-design";
import { MEASUREMENT_FIELDS } from "@/types/customer";
import { OrderDetailHeader } from "@/components/shared/order-detail-header";

export default async function EmployeeOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getOrderById(id);
  if (!result.success) notFound();

  const order = result.data;
  const customDesignRequest = order.customDesignRequestId
    ? await getCustomDesignRequestById(order.customDesignRequestId)
    : null;

  const measurementsResult = customDesignRequest?.success
    ? await getCustomerMeasurements(customDesignRequest.data.userId)
    : null;
  const measurements = measurementsResult?.success ? measurementsResult.data : [];
  const latest = [...measurements].sort(
    (a, b) => new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime()
  )[0];

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
          <div className="space-y-4">
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
                  <span className="text-muted-foreground">Occasion date: </span>
                  <span className="font-medium text-foreground">
                    {formatDate(customDesignRequest.data.occasionDate)}
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

            <div className="rounded-xl border border-border bg-card p-4">
              <p className="font-heading mb-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Measurements
              </p>

              {!latest ? (
                <div className="flex flex-col items-center gap-2 py-4 text-center">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                    <Ruler className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground">No measurements on file yet.</p>
                </div>
              ) : (
                <>
                  <p className="mb-2 text-xs text-muted-foreground">
                    Recorded {formatDate(latest.measuredAt)}
                  </p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
                    {MEASUREMENT_FIELDS.map(({ key, label }) => {
                      const value = latest[key];
                      if (value === null || value === undefined) return null;
                      return (
                        <div key={key}>
                          <p className="text-[11px] text-muted-foreground">{label}</p>
                          <p className="text-sm font-medium text-foreground">{String(value)} cm</p>
                        </div>
                      );
                    })}
                  </div>
                  {latest.notes && (
                    <p className="mt-3 text-xs italic text-muted-foreground">Note: {latest.notes}</p>
                  )}
                </>
              )}
            </div>
          </div>

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
          <p className="text-sm text-muted-foreground">No consultation details for this order.</p>
        </div>
      )}
    </div>
  );
}