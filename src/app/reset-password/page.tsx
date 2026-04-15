"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPassword } from "@/lib/api/auth";

const schema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  // No token in URL — link is broken
  if (!token) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Invalid link</CardTitle>
          <CardDescription>This reset link is not valid</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Please request a new password reset link.
          </p>
          <Button asChild className="w-full bg-amber-600 hover:bg-amber-700">
            <a href="/forgot-password">Request new link</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);

    const res = await resetPassword(token, data.newPassword);

    if (!res.success) {
      const msg = res.error?.message?.toLowerCase() ?? "";
      if (msg.includes("expir")) {
        setError("This reset link has expired. Please request a new one.");
      } else {
        setError(
          res.error?.message || "Something went wrong. Please try again.",
        );
      }
      setLoading(false);
      return;
    }

    setSuccess(true);
    // Redirect to login after 2 seconds
    setTimeout(() => router.push("/login"), 2000);
  };

  if (success) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Password updated!</CardTitle>
          <CardDescription>
            You can now sign in with your new password
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Redirecting you to sign in...
          </p>
          <div className="flex justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-amber-200 border-t-amber-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Set new password</CardTitle>
        <CardDescription>
          Choose a strong password for your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="newPassword">New password</Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="••••••••"
              {...register("newPassword")}
            />
            {errors.newPassword && (
              <p className="text-sm text-red-500">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="confirmPassword">Confirm new password</Label>
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
              {error}{" "}
              {error.includes("expired") && (
                <a href="/forgot-password" className="underline font-medium">
                  Request a new link
                </a>
              )}
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-amber-600 hover:bg-amber-700"
            disabled={loading}
          >
            {loading ? "Updating password..." : "Set new password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
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
          <ResetPasswordContent />
        </Suspense>
      </div>
    </div>
  );
}
