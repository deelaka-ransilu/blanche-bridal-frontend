import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      role: string;
      backendToken: string;
      email: string;
      firstName: string;
      lastName: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: string;
    backendToken: string;
    firstName: string;
    lastName: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    backendToken: string;
    email: string;
    firstName: string;
    lastName: string;
  }
}