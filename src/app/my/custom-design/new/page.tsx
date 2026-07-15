import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CustomDesignRequestForm } from "@/components/custom-design/custom-design-request-form";

export default function NewCustomDesignPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-40 sm:pb-10">
      <Link
        href="/my/dashboard"
        className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> Back
      </Link>

      <div className="space-y-2">
        <h1 className="font-heading text-2xl font-medium text-foreground">
          Custom Design Consultation
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Tell us about your dream dress and book a time to meet with our
          designer. We&apos;ll confirm your consultation shortly after —
          no payment required to request a slot.
        </p>
      </div>

      <CustomDesignRequestForm />
    </div>
  );
}