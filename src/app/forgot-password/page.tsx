"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { forgotPassword } from "@/lib/api/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [cooldownError, setCooldownError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setCooldownError(null);

    const res = await forgotPassword(email);

    // CONFLICT means the cooldown window hasn't passed yet — this is the
    // one case where we must NOT show the generic success message, since
    // no new email was actually sent. Every other outcome (email exists,
    // email doesn't exist) still shows the same neutral success message,
    // to avoid leaking account existence.
    if (!res.success && res.error === "CONFLICT") {
      setCooldownError(res.message || "Please wait a minute before trying again.");
      setLoading(false);
      return;
    }

    setSubmitted(true);
    setLoading(false);
  };

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Reset your password</CardTitle>
          <CardDescription>
            {submitted
              ? "Check your inbox for a reset link"
              : "Enter your email and we'll send you a reset link"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="space-y-4">
              <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
                If an account exists for <strong>{email}</strong>, a password
                reset link has been sent. The link expires in 1 hour.
              </div>
              <Link href="/login">
                <Button type="button" variant="outline" className="w-full">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to sign in
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-1">
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {cooldownError && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {cooldownError}
                </div>
              )}

              <Button type="submit" className="w-full text-white" disabled={loading}>
                {loading ? "Sending..." : "Send reset link"}
              </Button>

              <Link href="/login">
                <Button type="button" variant="ghost" size="sm" className="w-full">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to sign in
                </Button>
              </Link>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}