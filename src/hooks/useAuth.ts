"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/auth";
import { authStore } from "@/store/auth.store";
import { LoginRequest, RegisterRequest, ApiError } from "@/types/auth";
import axios from "axios";

export function useAuth() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const clearErrors = () => {
    setError(null);
    setFieldErrors({});
  };

  const handleApiError = (err: unknown) => {
    if (axios.isAxiosError(err) && err.response?.data) {
      const apiErr = err.response.data as ApiError;
      if (apiErr.validationErrors) {
        setFieldErrors(apiErr.validationErrors);
      } else {
        setError(apiErr.message || "Something went wrong");
      }
    } else {
      setError("Network error. Please try again.");
    }
  };

  const login = async (data: LoginRequest) => {
    setLoading(true);
    clearErrors();
    try {
      const res = await authApi.login(data);
      authStore.saveSession(res.data);
      const role = res.data.role;
      if (role === "ADMIN") {
        router.push("/admin");
      } else if (role === "EMPLOYEE") {
        router.push("/employee");
      } else {
        router.push("/");
      }
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    setLoading(true);
    clearErrors();
    try {
      const res = await authApi.register(data);
      authStore.saveSession(res.data);
      router.push("/");
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // clear client side regardless
    } finally {
      authStore.clearSession();
      router.push("/auth/login");
    }
  };

  return {
    login,
    register,
    logout,
    loading,
    error,
    fieldErrors,
    clearErrors,
    user: authStore.getUser(),
  };
}
