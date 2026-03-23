"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import GoogleLoginButton from "@/component/auth/GoogleLoginButton";

export default function RegisterPage() {
  const { register, loading, error, fieldErrors } = useAuth();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await register(form);
  };

  return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-gray-900 rounded-xl p-8 border border-gray-800">
        <h1 className="text-2xl font-semibold text-white mb-1">
          Create account
        </h1>
        <p className="text-gray-400 text-sm mb-6">Blanche Bridal</p>

        {error && (
          <div className="mb-4 px-4 py-3 rounded bg-red-900/40 border border-red-700 text-red-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            {
              label: "Full Name",
              name: "fullName",
              type: "text",
              placeholder: "Jane Doe",
            },
            {
              label: "Email",
              name: "email",
              type: "email",
              placeholder: "you@example.com",
            },
            {
              label: "Password",
              name: "password",
              type: "password",
              placeholder: "••••••••",
            },
            {
              label: "Phone",
              name: "phone",
              type: "text",
              placeholder: "+94771234567",
            },
          ].map(({ label, name, type, placeholder }) => (
            <div key={name}>
              <label className="block text-sm text-gray-300 mb-1">
                {label}
              </label>
              <input
                type={type}
                name={name}
                value={form[name as keyof typeof form]}
                onChange={handleChange}
                required
                placeholder={placeholder}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 text-sm"
              />
              {fieldErrors[name] && (
                <p className="text-red-400 text-xs mt-1">{fieldErrors[name]}</p>
              )}
            </div>
          ))}

          <p className="text-xs text-gray-500">
            Password must be 8+ chars with uppercase, lowercase, number and
            special char (@$!%*?&)
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-gray-900 font-medium py-2.5 rounded-lg text-sm hover:bg-gray-100 disabled:opacity-50 transition"
          >
            {loading ? "Creating account..." : "Create account"}
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
          Already have an account?{" "}
          <Link href="/auth/login" className="text-white hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
