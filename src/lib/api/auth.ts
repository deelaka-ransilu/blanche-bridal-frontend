import apiClient from "./client";
import { AuthResponse, LoginRequest, RegisterRequest } from "@/types/auth";

export const authApi = {
  register: (data: RegisterRequest) =>
    apiClient.post<AuthResponse>("/auth/register", data),

  login: (data: LoginRequest) =>
    apiClient.post<AuthResponse>("/auth/login", data),

  logout: () => apiClient.post("/auth/logout"),

  refresh: (refreshToken: string) =>
    apiClient.post<AuthResponse>("/auth/refresh", { refreshToken }),

  verifyEmail: (token: string) =>
    apiClient.post(`/auth/verify-email?token=${token}`),

  resendVerification: (email: string) =>
    apiClient.post(
      `/auth/resend-verification?email=${encodeURIComponent(email)}`,
    ),

  forgotPassword: (email: string) =>
    apiClient.post("/auth/forgot-password", { email }),

  resetPassword: (token: string, newPassword: string) =>
    apiClient.post("/auth/reset-password", { token, newPassword }),

  googleAuth: (idToken: string) =>
    apiClient.post<AuthResponse>("/auth/google", { idToken }),
};
