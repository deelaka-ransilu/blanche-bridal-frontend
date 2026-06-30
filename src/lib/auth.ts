import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";
import { googleAuth } from "@/lib/api/auth";

/**
 * NextAuth v4 behavior: when authorize() throws, the thrown Error's `message`
 * becomes the `error` query param on the redirect back to the sign-in page
 * (e.g. /login?error=Invalid%20email%20or%20password). Returning `null` instead
 * produces the generic `error=CredentialsSignin` — that swallowing of the real
 * backend message into a generic error was the bug we're fixing here. A plain
 * `Error` is correct for v4; v5/Auth.js uses a different CredentialsSignin class,
 * which does not exist in this v4 codebase.
 */

function decodeJwtPayload(token: string): Record<string, unknown> {
  const payload = token.split(".")[1];
  // base64url -> base64, then pad to a multiple of 4 — raw atob/Buffer on an
  // un-padded base64url string throws on certain payloads, which is the
  // "fragile decode" bug noted while reviewing the old auth.ts.
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
        password: { label: "Password", type: "password" },
        backendToken: { label: "Token", type: "text" },
        backendRole: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.backendToken) {
          throw new Error("Email and password are required.");
        }

        // Backend was already called once, client-side, by LoginForm's onSubmit —
        // that call is what set the refreshToken cookie. Re-calling it here would
        // hit Spring Boot a second time with no cookie-forwarding benefit, and was
        // observed to 401 under fast double-submission. So authorize() just trusts
        // the already-validated token instead.
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
          // Same fix as Credentials: surface the real reason instead of a bare `false`,
          // which NextAuth would otherwise show as a generic "AccessDenied" error.
          return `/login?error=${encodeURIComponent(res.message || "Google sign-in failed.")}`;
        }

        if (!res.data.token) {
          // Account created but not yet verified (matches AuthController: googleAuth
          // returns {success:true, message:"..."} with no data.token in that case).
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

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
    // NOTE: this is the *NextAuth session* lifetime, separate from the backend's
    // 15-minute access token. It does not refresh the backend access token by
    // itself — that refresh happens per-request inside apiRequest() in client.ts.
    // See the Progress Log entry on booking/checkout for the known gap this leaves
    // (refreshed token doesn't get written back into this session).
    maxAge: 24 * 60 * 60,
  },

  secret: process.env.NEXTAUTH_SECRET,
};