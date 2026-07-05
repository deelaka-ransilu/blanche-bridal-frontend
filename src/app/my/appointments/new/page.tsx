import { getAvailableProducts } from "@/lib/api/products";
import { BookAppointmentForm } from "@/components/appointments/book-appointment-form";

export default async function NewAppointmentPage() {
  const productsResult = await getAvailableProducts();
  const products = productsResult.success ? productsResult.data : [];

  return (
    <div className="space-y-5">
      <h1 className="font-heading text-lg font-medium text-foreground">Book an Appointment</h1>
      <BookAppointmentForm products={products} />
    </div>
  );
}