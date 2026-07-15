"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { ArrowLeft, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { register } from "@/lib/api/auth";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await register({ email, password, firstName, lastName, phone });

    if (!res.success) {
      setError(res.message || "Registration failed. Please try again.");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="flex min-h-svh items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Check your email</CardTitle>
            <CardDescription>
              We&apos;ve sent a verification link to <strong>{email}</strong>. Click it to
              activate your account, then come back and sign in.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/login">Go to sign in</Link>
            </Button>

            <div className="mt-5 border-t border-border pt-4">
              <Link href="/">
                <Button type="button" variant="ghost" size="sm" className="w-full">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>Join Blanche Bridal</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Input
                  id="firstName"
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <Input
                  id="lastName"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Input
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
            <Input
              id="phone"
              type="tel"
              placeholder="+94 71 234 5678"
              pattern="^(0\d{9}|\+\d{9,12})$"
              maxLength={15}
              title="Enter a valid phone number, e.g. 0712345678 or +94712345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

            <div className="space-y-1">
              <Input
                id="password"
                type="password"
                placeholder="Password, At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full text-white" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => signIn("google", { callbackUrl: "/auth/redirect" })}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.766 12.276c0-.818-.074-1.606-.21-2.364H12.24v4.474h6.482a5.54 5.54 0 0 1-2.4 3.633v3.017h3.885c2.274-2.093 3.559-5.176 3.559-8.76z"/>
              <path fill="#34A853" d="M12.24 24c3.24 0 5.956-1.075 7.941-2.9l-3.885-3.017c-1.075.72-2.45 1.147-4.056 1.147-3.12 0-5.762-2.107-6.705-4.938H1.52v3.113C3.494 21.3 7.575 24 12.24 24z"/>
              <path fill="#FBBC05" d="M5.535 14.292a7.22 7.22 0 0 1-.376-2.292c0-.795.137-1.567.376-2.292V6.595H1.52A11.997 11.997 0 0 0 .24 12c0 1.936.463 3.767 1.28 5.405l4.015-3.113z"/>
              <path fill="#EA4335" d="M12.24 4.77c1.762 0 3.344.606 4.588 1.795l3.442-3.442C18.192 1.19 15.477 0 12.24 0 7.575 0 3.494 2.7 1.52 6.595l4.015 3.113c.943-2.831 3.585-4.938 6.705-4.938z"/>
            </svg>
            Continue with Google
          </Button>

          <div className="mt-5 grid grid-cols-2 gap-2 border-t border-border pt-4">
            <Link href="/">
              <Button type="button" variant="ghost" size="sm" className="w-full">
                <ArrowLeft className="h-3.5 w-3.5" />
                Back home
              </Button>
            </Link>
            <Link href="/login">
              <Button type="button" variant="ghost" size="sm" className="w-full">
                <LogIn className="h-3.5 w-3.5" />
                Sign in
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}