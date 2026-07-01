"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { verifyEmail } from "@/lib/api/auth";

type VerifyStatus = "loading" | "success" | "error" | "no-token" | "pending";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const pending = searchParams.get("pending");

  const [status, setStatus] = useState<VerifyStatus>("loading");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (pending === "true") {
      setStatus("pending");
      return;
    }

    if (!token) {
      setStatus("no-token");
      return;
    }

    verifyEmail(token).then((res) => {
      if (res.success) {
        setStatus("success");
      } else {
        setStatus("error");
        setMessage(res.message || "Verification failed. The link may have expired.");
      }
    });
  }, [token, pending]);

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {status === "loading" && (
            <>
              <CardTitle className="text-2xl">Verifying...</CardTitle>
              <CardDescription>Please wait while we confirm your email.</CardDescription>
            </>
          )}

          {status === "pending" && (
            <>
              <CardTitle className="text-2xl">Check your email</CardTitle>
              <CardDescription>
                We&apos;ve sent a verification link to your email address. Click it to
                activate your account, then come back and sign in.
              </CardDescription>
            </>
          )}

          {status === "success" && (
            <>
              <CardTitle className="text-2xl">Email verified!</CardTitle>
              <CardDescription>
                Your account is now active. You can sign in.
              </CardDescription>
            </>
          )}

          {status === "error" && (
            <>
              <CardTitle className="text-2xl">Verification failed</CardTitle>
              <CardDescription>{message}</CardDescription>
            </>
          )}

          {status === "no-token" && (
            <>
              <CardTitle className="text-2xl">Invalid link</CardTitle>
              <CardDescription>
                This verification link looks incomplete or invalid. If you just registered,
                please check your email for the correct link.
              </CardDescription>
            </>
          )}
        </CardHeader>

        {status !== "loading" && (
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/login">Back to sign in</Link>
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}