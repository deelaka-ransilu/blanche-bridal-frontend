"use client";

import { useState } from "react";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { submitInquiry } from "@/lib/api/inquiries";
import { toast } from "sonner";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

// ─── helpers ──────────────────────────────────────────────────────────────────

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function InquiryPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  function validate() {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Name is required.";
    if (!form.email.trim()) next.email = "Email is required.";
    else if (!isValidEmail(form.email)) next.email = "Enter a valid email.";
    if (!form.message.trim()) next.message = "Message is required.";
    else if (form.message.trim().length < 10)
      next.message = "Message must be at least 10 characters.";
    return next;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    try {
      const res = await submitInquiry({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        subject: form.subject.trim() || undefined,
        message: form.message.trim(),
        imageUrl: imageUrls[0] ?? undefined,
      });
      if (res.success) {
        setSubmitted(true);
      } else {
        toast.error(
          res.error?.message ?? "Failed to send message. Please try again.",
        );
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Success screen ─────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#fffaf7] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            Message received!
          </h2>
          <p className="text-sm text-muted-foreground">
            We've received your message and will get back to you within 24
            hours.
          </p>
          <div className="flex gap-3 justify-center pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setSubmitted(false);
                setForm({
                  name: "",
                  email: "",
                  phone: "",
                  subject: "",
                  message: "",
                });
                setImageUrls([]);
              }}
            >
              Send Another
            </Button>
            <Button
              className="bg-amber-600 hover:bg-amber-700 text-white"
              onClick={() => (window.location.href = "/")}
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#fffaf7]">
      {/* Hero banner */}
      <div className="bg-amber-50 border-b border-amber-100 py-12 px-4 text-center">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">
          Get in Touch
        </h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Have a question or want to discuss alterations? We'd love to hear from
          you.
        </p>
      </div>

      <div className="max-w-xl mx-auto px-4 py-12">
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Name + Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Your name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                className={errors.name ? "border-red-400" : ""}
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                className={errors.email ? "border-red-400" : ""}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email}</p>
              )}
            </div>
          </div>

          {/* Phone + Subject */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input
                id="phone"
                placeholder="+94 77 123 4567"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="subject">Subject (optional)</Label>
              <Input
                id="subject"
                placeholder="e.g. Alteration enquiry"
                value={form.subject}
                onChange={(e) => set("subject", e.target.value)}
              />
            </div>
          </div>

          {/* Message */}
          <div className="space-y-1.5">
            <Label htmlFor="message">
              Message <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="message"
              placeholder="Tell us how we can help…"
              rows={5}
              value={form.message}
              onChange={(e) => set("message", e.target.value)}
              className={errors.message ? "border-red-400" : ""}
            />
            {errors.message && (
              <p className="text-xs text-red-500">{errors.message}</p>
            )}
          </div>

          {/* Reference image */}
          <div className="space-y-1.5">
            <Label>Reference photo (optional)</Label>
            <p className="text-xs text-muted-foreground">
              Upload a reference photo (e.g. dress style you like)
            </p>
            <ImageUpload
              urls={imageUrls}
              onChange={setImageUrls}
              maxImages={1}
            />
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white"
          >
            {submitting ? "Sending…" : "Send Message"}
          </Button>
        </form>
      </div>
    </div>
  );
}
