import { UserRole } from "@/types";
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      email: string;
      role: string;
      backendToken: string;
      firstName: string;
      lastName?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    backendToken: string;
    email: string;
    firstName: string;
    lastName?: string;
  }
}
