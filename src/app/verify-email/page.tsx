"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { authApi } from "@/lib/api/auth";
import Link from "next/link";
import { Suspense } from "react";

function VerifyEmailContent() {
  const params = useSearchParams();
  const token = params.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token found.");
      return;
    }
    authApi
      .verifyEmail(token)
      .then(() => {
        setStatus("success");
        setMessage("Email verified successfully.");
      })
      .catch(() => {
        setStatus("error");
        setMessage("Verification failed or link expired.");
      });
  }, [token]);

  return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-gray-900 rounded-xl p-8 border border-gray-800 text-center">
        <h1 className="text-xl font-semibold text-white mb-3">
          Email Verification
        </h1>
        {status === "loading" && (
          <p className="text-gray-400 text-sm">Verifying...</p>
        )}
        {status === "success" && (
          <p className="text-green-400 text-sm">{message}</p>
        )}
        {status === "error" && (
          <p className="text-red-400 text-sm">{message}</p>
        )}
        {status !== "loading" && (
          <Link
            href="/auth/login"
            className="mt-6 inline-block text-sm text-white hover:underline"
          >
            Go to Login
          </Link>
        )}
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
