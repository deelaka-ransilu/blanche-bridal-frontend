import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";
import { login, googleAuth } from "@/lib/api/auth";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const res = await login(credentials.email, credentials.password);
          if (!res.success || !res.data?.token) return null;

          const payload = JSON.parse(
            Buffer.from(res.data.token.split(".")[1], "base64").toString(),
          );

          return {
            id: credentials.email,
            email: credentials.email,
            role: res.data.role,
            backendToken: res.data.token,
            firstName: payload.firstName ?? "",
          };
        } catch {
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && account.id_token) {
        try {
          const res = await googleAuth(account.id_token);

          // Backend call failed entirely
          if (!res.success) return false;

          // New Google user — no token yet, needs email verification
          // Redirect to verify-email page instead of showing AccessDenied
          if (!res.data?.token) {
            return "/verify-email?pending=true";
          }

          // Existing verified user — attach backend data to session
          const payload = JSON.parse(
            Buffer.from(res.data.token.split(".")[1], "base64").toString(),
          );

          (user as any).role = res.data.role;
          (user as any).backendToken = res.data.token;
          (user as any).firstName = payload.firstName ?? "";
          return true;
        } catch {
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.backendToken = (user as any).backendToken;
        token.email = (user as any).email;
        token.firstName = (user as any).firstName;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.role = token.role as string;
        session.user.backendToken = token.backendToken as string;
        session.user.email = token.email as string;
        session.user.firstName = token.firstName as string;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },

  secret: process.env.NEXTAUTH_SECRET,
};
