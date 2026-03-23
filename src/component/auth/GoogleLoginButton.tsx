"use client";

import { useGoogleLogin } from "@react-oauth/google";
import { authApi } from "@/lib/api/auth";
import { authStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";

export default function GoogleLoginButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError(null);
      try {
        console.log(
          "Google token received:",
          tokenResponse.access_token?.substring(0, 20),
        );
        const res = await authApi.googleAuth(tokenResponse.access_token);
        console.log("Backend response:", res.data);
        authStore.saveSession(res.data);
        console.log("Session saved, role:", res.data.role);
        const role = res.data.role;
        if (role === "ADMIN") {
          router.push("/admin");
        } else if (role === "EMPLOYEE") {
          router.push("/employee");
        } else {
          router.push("/");
        }
      } catch (err) {
        console.error("Full error:", err);
        if (axios.isAxiosError(err) && err.response?.data?.message) {
          setError(err.response.data.message);
        } else {
          setError("Google login failed. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setError("Google login was cancelled or failed.");
    },
  });

  return (
    <div className="w-full">
      {error && (
        <p className="text-red-400 text-xs mb-2 text-center">{error}</p>
      )}
      <button
        onClick={() => handleGoogleLogin()}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-200 text-sm py-2.5 rounded-lg transition disabled:opacity-50"
      >
        {loading ? (
          <span>Connecting...</span>
        ) : (
          <>
            <GoogleIcon />
            <span>Continue with Google</span>
          </>
        )}
      </button>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  );
}
