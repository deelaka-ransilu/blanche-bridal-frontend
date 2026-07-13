import { PublicNav } from "@/components/public-nav";
import { FaqAccordion } from "@/components/faq-accordion";

export default function FaqPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 pb-16 pt-28">
      <PublicNav />

      <div className="mb-10 text-center">
        <p className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Frequently asked questions
        </p>
        <h1 className="font-heading text-3xl font-bold text-foreground">
          Got questions?
        </h1>
      </div>

      <FaqAccordion />
    </main>
  );
}