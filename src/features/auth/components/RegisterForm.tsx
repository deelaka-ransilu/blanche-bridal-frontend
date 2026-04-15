"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { register as registerUser, resendVerification } from "@/lib/api/auth";

const registerSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Please enter a valid email"),
    phone: z
      .string()
      .regex(/^[0-9+\s\-()]{7,15}$/, "Please enter a valid phone number")
      .optional()
      .or(z.literal("")),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

function GoogleButton() {
  const [loading, setLoading] = useState(false);
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      disabled={loading}
      onClick={() => {
        setLoading(true);
        signIn("google", { callbackUrl: "/dashboard" });
      }}
    >
      <svg className="mr-2 size-4" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      {loading ? "Redirecting..." : "Continue with Google"}
    </Button>
  );
}

// Shown after successful registration
// Lets the user resend if the 5-minute window expired
function VerificationSentCard({ email }: { email: string }) {
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);

  const handleResend = async () => {
    setResendLoading(true);
    setResendMessage(null);
    setResendError(null);

    const res = await resendVerification(email);

    if (!res.success) {
      setResendError(
        res.error?.message || "Failed to resend. Please try again.",
      );
    } else {
      setResendMessage("A new verification email has been sent.");
    }

    setResendLoading(false);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Check your email</CardTitle>
        <CardDescription>We sent a verification link to</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <p className="font-medium text-amber-700">{email}</p>

        <p className="text-sm text-muted-foreground">
          Click the link in the email to activate your account. The link expires
          in <span className="font-medium">5 minutes</span>.
        </p>

        {resendMessage && (
          <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
            {resendMessage}
          </div>
        )}

        {resendError && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
            {resendError}
          </div>
        )}

        <p className="text-sm text-muted-foreground">
          Didn&apos;t receive it?{" "}
          <button
            onClick={handleResend}
            disabled={resendLoading}
            className="text-amber-600 hover:underline disabled:opacity-50"
          >
            {resendLoading ? "Sending..." : "Resend email"}
          </button>
        </p>

        <p className="text-sm text-muted-foreground">
          Already verified?{" "}
          <a href="/login" className="text-amber-600 hover:underline">
            Sign in
          </a>
        </p>
      </CardContent>
    </Card>
  );
}

export default function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    setError(null);

    const res = await registerUser({
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone || undefined,
    });

    if (!res.success) {
      const code = res.error?.code;
      if (code === "CONFLICT" || res.error?.status === 409) {
        setError("An account with this email already exists.");
      } else {
        setError(
          res.error?.message || "Registration failed. Please try again.",
        );
      }
      setLoading(false);
      return;
    }

    // Registration succeeded — show the "check your email" screen
    setRegisteredEmail(data.email);
    setLoading(false);
  };

  // Swap out the form for the confirmation card
  if (registeredEmail) {
    return <VerificationSentCard email={registeredEmail} />;
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Blanche Bridal</CardTitle>
        <CardDescription>Create your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1 space-y-1">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                type="text"
                placeholder="Nimal"
                {...register("firstName")}
              />
              {errors.firstName && (
                <p className="text-sm text-red-500">
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div className="flex-1 space-y-1">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Perera"
                {...register("lastName")}
              />
              {errors.lastName && (
                <p className="text-sm text-red-500">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="phone">
              Phone{" "}
              <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="077 123 4567"
              {...register("phone")}
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </Button>

          <div className="relative my-1">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                or
              </span>
            </div>
          </div>

          <GoogleButton />

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <a href="/login" className="text-amber-600 hover:underline">
              Sign in
            </a>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
