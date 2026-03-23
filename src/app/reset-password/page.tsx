"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authApi } from "@/lib/api/auth";

function ResetPasswordContent() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      await authApi.resetPassword(token, password);
      setStatus("success");
      setMessage("Password reset. Redirecting to login...");
      setTimeout(() => router.push("/auth/login"), 2000);
    } catch {
      setStatus("error");
      setMessage("Reset failed. Link may be expired.");
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-gray-900 rounded-xl p-8 border border-gray-800">
        <h1 className="text-xl font-semibold text-white mb-6">
          Reset Password
        </h1>

        {status === "success" && (
          <p className="text-green-400 text-sm mb-4">{message}</p>
        )}
        {status === "error" && (
          <p className="text-red-400 text-sm mb-4">{message}</p>
        )}

        {status !== "success" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 text-sm"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full bg-white text-gray-900 font-medium py-2.5 rounded-lg text-sm hover:bg-gray-100 disabled:opacity-50 transition"
            >
              {status === "loading" ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}
