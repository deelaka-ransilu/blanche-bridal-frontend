import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getAvailableProducts } from "@/lib/api/products";
import { BookAppointmentForm } from "@/components/appointments/book-appointment-form";

export default async function NewAppointmentPage() {
  const productsResult = await getAvailableProducts();
  const products = productsResult.success ? productsResult.data : [];

  return (
    <div className="mx-auto max-w-2xl space-y-5 pb-40 sm:pb-10">
      <Link
        href="/my/appointments"
        className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> Appointments
      </Link>

      <h1 className="font-heading text-xl font-medium text-foreground">Book an Appointment</h1>

      <BookAppointmentForm products={products} />
    </div>
  );
}