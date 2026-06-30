import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";
import { googleAuth } from "@/lib/api/auth";

function decodeJwtPayload(token: string): Record<string, unknown> {
  const payload = token.split(".")[1];
  const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  return JSON.parse(Buffer.from(padded, "base64").toString("utf-8"));
}

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
        backendToken: { label: "Token", type: "text" },
        backendRole: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.backendToken) {
          throw new Error("Email and password are required.");
        }
        const payload = decodeJwtPayload(credentials.backendToken);
        return {
          id: credentials.email,
          email: credentials.email,
          role: credentials.backendRole,
          backendToken: credentials.backendToken,
          firstName: (payload.firstName as string) ?? "",
          lastName: (payload.lastName as string) ?? "",
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && account.id_token) {
        const res = await googleAuth(account.id_token);

        if (!res.success) {
          return `/login?error=${encodeURIComponent(res.message || "Google sign-in failed.")}`;
        }
        if (!res.data.token) {
          return "/verify-email?pending=true";
        }

        const payload = decodeJwtPayload(res.data.token);
        (user as any).role = res.data.role;
        (user as any).backendToken = res.data.token;
        (user as any).firstName = (payload.firstName as string) ?? "";
        (user as any).lastName = (payload.lastName as string) ?? "";
        return true;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.backendToken = (user as any).backendToken;
        token.email = (user as any).email;
        token.firstName = (user as any).firstName;
        token.lastName = (user as any).lastName;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role as string;
        session.user.backendToken = token.backendToken as string;
        session.user.email = token.email as string;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
      }
      return session;
    },
  },
  pages: { signIn: "/login", error: "/login" },
  session: { strategy: "jwt", maxAge: 24 * 60 * 60 },
  secret: process.env.NEXTAUTH_SECRET,
};