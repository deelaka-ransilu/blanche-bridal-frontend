"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { ArrowLeft, UserPlus } from "lucide-react";
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
import { login } from "@/lib/api/auth";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const loginRes = await login(email, password);

    if (!loginRes.success) {
      setError(loginRes.message || "Invalid email or password.");
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", {
      email,
      backendToken: loginRes.data.token,
      backendRole: loginRes.data.role,
      redirect: false,
    });

    if (result?.error) {
      setError("Something went wrong establishing your session. Please try again.");
      setLoading(false);
      return;
    }

    const sessionRes = await fetch("/api/auth/session");
    const session = await sessionRes.json();
    const role = session?.user?.role;

    // Role-based dashboards are protected routes -- only honor callbackUrl
    // when it actually matches where this role belongs, so an admin can't be
    // bounced to a customer-only route (or vice versa) via a crafted link.
    if (callbackUrl) {
      const isCustomerRoute = callbackUrl.startsWith("/my");
      const isAdminRoute = callbackUrl.startsWith("/admin");
      const isEmployeeRoute = callbackUrl.startsWith("/employee");

      if (
        (role === "ADMIN" && isAdminRoute) ||
        (role === "EMPLOYEE" && isEmployeeRoute) ||
        (role !== "ADMIN" && role !== "EMPLOYEE" && isCustomerRoute)
      ) {
        router.push(callbackUrl);
        return;
      }
    }

    switch (role) {
      case "ADMIN":
        router.push("/admin/dashboard");
        break;
      case "EMPLOYEE":
        router.push("/employee/orders");   // was "/employee/dashboard"
        break;
      default:
        router.push("/my/dashboard");
        break;
    }
  };

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Blanche Bridal</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
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

            <div className="space-y-1">
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="text-right">
                <Link
                  href="/forgot-password"
                  className="text-xs text-muted-foreground hover:text-foreground hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full text-white" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
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
            onClick={() =>
              signIn("google", {
                callbackUrl: callbackUrl
                  ? `/auth/redirect?callbackUrl=${encodeURIComponent(callbackUrl)}`
                  : "/auth/redirect",
              })
            }
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
            <Link href="/register">
              <Button type="button" variant="ghost" size="sm" className="w-full">
                <UserPlus className="h-3.5 w-3.5" />
                Sign up
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}