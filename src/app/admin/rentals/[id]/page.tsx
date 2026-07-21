import { getRentalById } from "@/lib/api/rentals";
import { notFound } from "next/navigation";
import { AdminRentalDetail } from "@/components/rentals/admin-rental-detail";

export default async function AdminRentalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getRentalById(id);

  if (!result.success) {
    if (result.message?.toLowerCase().includes("not found")) {
      notFound();
    }
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
        Couldn&apos;t load this rental: {result.message}
      </div>
    );
  }

  return <AdminRentalDetail rental={result.data} />;
}