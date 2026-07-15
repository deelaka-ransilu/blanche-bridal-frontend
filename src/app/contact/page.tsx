import { ContactForm } from "@/components/inquiries/contact-form";
import { PublicNav } from "@/components/public-nav";
import { FaqAccordion } from "@/components/faq-accordion";
import { SiteFooter } from "@/components/site-footer";

export default function ContactPage() {
  return (
    <>
      <main className="mx-auto max-w-2xl px-4 pb-16 pt-28 lg:max-w-5xl">
        <PublicNav />

        <div className="mb-10 text-center lg:mb-14">
          <p className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Frequently asked questions
          </p>
          <h1 className="font-heading text-3xl font-bold text-foreground">
            Got questions?
          </h1>
        </div>

        <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-8">
          <div className="mb-14 lg:mb-0">
            <FaqAccordion />
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 pb-6 sm:p-8 sm:pb-7 lg:sticky lg:top-28">
            <h2 className="font-heading text-2xl font-bold text-foreground">Get in Touch</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Have a question about a dress, a custom order, or anything else? Send us a message.
            </p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}