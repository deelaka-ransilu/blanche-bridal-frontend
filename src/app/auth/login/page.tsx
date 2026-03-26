"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import GoogleLoginButton from "@/component/auth/GoogleLoginButton";

export default function LoginPage() {
  const { login, loading, error, fieldErrors } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login({ email, password });
  };

  return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-gray-900 rounded-xl p-8 border border-gray-800">
        <h1 className="text-2xl font-semibold text-white mb-1">Sign in</h1>
        <p className="text-gray-400 text-sm mb-6">
          Blanche Bridal — Admin & Staff Portal
        </p>

        {error && (
          <div className="mb-4 px-4 py-3 rounded bg-red-900/40 border border-red-700 text-red-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 text-sm"
              placeholder="you@example.com"
            />
            {fieldErrors.email && (
              <p className="text-red-400 text-xs mt-1">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 text-sm"
              placeholder="••••••••"
            />
            {fieldErrors.password && (
              <p className="text-red-400 text-xs mt-1">
                {fieldErrors.password}
              </p>
            )}
          </div>

          <div className="text-right">
            <Link
              href="/auth/forgot-password"
              className="text-xs text-gray-400 hover:text-white"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-gray-900 font-medium py-2.5 rounded-lg text-sm hover:bg-gray-100 disabled:opacity-50 transition"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-800" />
          <span className="text-xs text-gray-600">or</span>
          <div className="flex-1 h-px bg-gray-800" />
        </div>

        <div className="mt-4">
          <GoogleLoginButton />
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="text-white hover:underline">
            Register
          </Link>
        </p>
      </div>
    </main>
  );
}
