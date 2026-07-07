import { ContactForm } from "@/components/inquiries/contact-form";
import { PublicNav } from "@/components/public-nav";

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <PublicNav />
      <h1 className="font-serif text-3xl text-brand-600">Get in Touch</h1>
      <p className="mt-2 text-gray-600">
        Have a question about a dress, a custom order, or anything else? Send us a message.
      </p>
      <div className="mt-8">
        <ContactForm />
      </div>
    </main>
  );
}