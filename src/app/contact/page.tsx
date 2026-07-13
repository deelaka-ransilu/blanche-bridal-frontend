import { ContactForm } from "@/components/inquiries/contact-form";
import { PublicNav } from "@/components/public-nav";

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 pb-16 pt-28">
      <PublicNav />

      <div className="rounded-3xl border border-border bg-card p-6 pb-6 sm:p-8 sm:pb-7">
        <h1 className="font-heading text-2xl font-bold text-foreground">Get in touch</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Have a question about a dress, a custom order, or anything else? Send us a message.
        </p>
        <div className="mt-6">
          <ContactForm />
        </div>
      </div>
    </main>
  );
}