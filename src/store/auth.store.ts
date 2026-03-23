import Cookies from "js-cookie";
import { User, AuthResponse } from "@/types/auth";

export const authStore = {
  saveSession(data: AuthResponse): void {
    Cookies.set("access_token", data.accessToken, { expires: 1 / 96 }); // 15 min
    Cookies.set("refresh_token", data.refreshToken, { expires: 7 });
    const user: User = {
      publicId: data.publicId,
      fullName: data.fullName,
      email: data.email,
      role: data.role,
      emailVerified: data.emailVerified,
      profileCompleted: data.profileCompleted,
    };
    localStorage.setItem("user", JSON.stringify(user));
  },

  clearSession(): void {
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    localStorage.removeItem("user");
  },

  getUser(): User | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem("user");
    return raw ? (JSON.parse(raw) as User) : null;
  },

  getAccessToken(): string | undefined {
    return Cookies.get("access_token");
  },

  isLoggedIn(): boolean {
    return !!Cookies.get("access_token") || !!Cookies.get("refresh_token");
  },
};
