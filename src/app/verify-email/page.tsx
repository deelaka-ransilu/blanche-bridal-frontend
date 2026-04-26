"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { verifyEmail, resendVerification } from "@/lib/api/auth";

type Status = "loading" | "success" | "expired" | "invalid";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const pending = searchParams.get("pending");

  // New Google user redirected here after registration
  if (pending && !token) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Check your email</CardTitle>
          <CardDescription>
            One more step to activate your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            We sent a verification link to your Google email address. The link
            expires in <span className="font-medium">5 minutes</span>.
          </p>
          <p className="text-sm text-muted-foreground">
            Didn&apos;t receive it?{" "}
            <a href="/register" className="text-amber-600 hover:underline">
              Try registering again
            </a>
          </p>
          <p className="text-sm text-muted-foreground">
            <a href="/login" className="text-amber-600 hover:underline">
              Back to sign in
            </a>
          </p>
        </CardContent>
      </Card>
    );
  }

  const [status, setStatus] = useState<Status>("loading");
  const [resendEmail, setResendEmail] = useState("");
  const [resendSent, setResendSent] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }

    verifyEmail(token).then((res) => {
      if (res.success) {
        setStatus("success");
      } else {
        // "expired" means they need a new link, "invalid" means token doesn't exist
        const msg = res.error?.message?.toLowerCase() ?? "";
        setStatus(msg.includes("expir") ? "expired" : "invalid");
      }
    });
  }, [token]);

  const handleResend = async () => {
    if (!resendEmail) return;
    setResendLoading(true);
    setResendError(null);

    const res = await resendVerification(resendEmail);
    if (!res.success) {
      setResendError(
        res.error?.message || "Failed to resend. Please try again.",
      );
    } else {
      setResendSent(true);
    }
    setResendLoading(false);
  };

  // Loading state — backend is checking the token
  if (status === "loading") {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Verifying your email</CardTitle>
          <CardDescription>Please wait a moment...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-200 border-t-amber-600" />
        </CardContent>
      </Card>
    );
  }

  // Success — account is now active
  if (status === "success") {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Email verified!</CardTitle>
          <CardDescription>Your account is now active</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            You can now sign in to your Blanche Bridal account.
          </p>
          <Button asChild className="w-full bg-amber-600 hover:bg-amber-700">
            <a href="/login">Sign in</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Expired — token existed but timed out, let them request a new one
  if (status === "expired") {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Link expired</CardTitle>
          <CardDescription>Your verification link has expired</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            Enter your email address and we&apos;ll send you a new verification
            link.
          </p>

          {resendSent ? (
            <div className="rounded-md bg-green-50 p-3 text-center text-sm text-green-700">
              A new verification email has been sent. Check your inbox.
            </div>
          ) : (
            <>
              <input
                type="email"
                placeholder="you@example.com"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              />
              {resendError && (
                <p className="text-sm text-red-600">{resendError}</p>
              )}
              <Button
                onClick={handleResend}
                disabled={resendLoading || !resendEmail}
                className="w-full bg-amber-600 hover:bg-amber-700"
              >
                {resendLoading ? "Sending..." : "Resend verification email"}
              </Button>
            </>
          )}

          <p className="text-center text-sm text-muted-foreground">
            <a href="/login" className="text-amber-600 hover:underline">
              Back to sign in
            </a>
          </p>
        </CardContent>
      </Card>
    );
  }

  // Invalid — token doesn't exist at all
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Invalid link</CardTitle>
        <CardDescription>This verification link is not valid</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <p className="text-sm text-muted-foreground">
          This link may have already been used or doesn&apos;t exist.
        </p>
        <Button asChild className="w-full bg-amber-600 hover:bg-amber-700">
          <a href="/register">Register again</a>
        </Button>
        <p className="text-sm text-muted-foreground">
          <a href="/login" className="text-amber-600 hover:underline">
            Back to sign in
          </a>
        </p>
      </CardContent>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Suspense
          fallback={
            <Card className="w-full max-w-md">
              <CardContent className="flex justify-center py-10">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-200 border-t-amber-600" />
              </CardContent>
            </Card>
          }
        >
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  );
}
