import { PublicNav } from "@/components/layout/public-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { SmoothScroll } from "@/components/effects/smooth-scroll";
import { BookAppointmentForm } from "@/components/appointments/book-appointment-form";

export default function NewAppointmentPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      <SmoothScroll>
        <main className="mx-auto max-w-2xl px-6 pb-24 pt-24 sm:pt-28">
          <div className="mb-8 text-center sm:text-left">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Blanche Bridal
            </p>
            <h1 className="font-heading mt-2 text-3xl font-medium text-foreground sm:text-4xl">
              Book an Appointment
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Pick a date and time that works for you — you&apos;ll confirm your
              details on the next step.
            </p>
          </div>

          <BookAppointmentForm />
        </main>
      </SmoothScroll>

      <SiteFooter />
    </div>
  );
}