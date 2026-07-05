import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";
import { cookies } from "next/headers";
import { googleAuth } from "@/lib/api/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

function decodeJwtPayload(token: string): Record<string, unknown> {
  const payload = token.split(".")[1];
  const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  return JSON.parse(Buffer.from(padded, "base64").toString("utf-8"));
}

// Backend access tokens live for 15 min (jwt.expiration=900000ms). Refresh a
// little early (60s buffer) rather than racing the exact expiry instant.
const ACCESS_TOKEN_LIFETIME_MS = 15 * 60 * 1000;
const REFRESH_BUFFER_MS = 60 * 1000;

/**
 * Calls the backend's POST /api/auth/refresh using the httpOnly refreshToken
 * cookie already present in the browser (path-scoped to /api/auth, set by
 * AuthController.setRefreshTokenCookie on login/google-auth/refresh).
 *
 * Runs inside the NextAuth route handler's request context, so next/headers
 * cookies() has access to the incoming request's cookies here — same
 * mechanism lib/api/server.ts's refreshAccessToken() relies on for Server
 * Actions. This forwards the cookie manually via a Cookie header (rather
 * than relying on `credentials: "include"`, which only works for
 * same-origin/browser-initiated fetches, not server-to-server calls).
 */
async function refreshBackendToken(): Promise<{ token: string } | null> {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    const res = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { Cookie: cookieHeader },
    });

    // Backend now rotates the refresh token on every call (see
    // AuthServiceImpl.refresh() / AuthController.refresh() fixes) — forward
    // the new Set-Cookie back to the browser exactly like server.ts does.
    const setCookies = res.headers.getSetCookie?.() ?? [];
    for (const cookie of setCookies) {
      const [nameValue] = cookie.split(";");
      const [name, value] = nameValue.split("=");
      if (name && value) {
        cookieStore.set(name, decodeURIComponent(value));
      }
    }

    if (!res.ok) return null;

    const body = await res.json();
    if (!body?.success || !body?.data?.token) return null;

    return { token: body.data.token as string };
  } catch {
    return null;
  }
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
          if (res.message?.toLowerCase().includes("verify your email")) {
            return "/verify-email?pending=true";
          }
          return `/login?error=${encodeURIComponent(res.message || "Google sign-in failed.")}`;
        }

        if (!res.data?.token) {
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
      // Fresh sign-in — seed the token and record when the backend access
      // token will expire.
      if (user) {
        token.role = (user as any).role;
        token.backendToken = (user as any).backendToken;
        token.email = (user as any).email;
        token.firstName = (user as any).firstName;
        token.lastName = (user as any).lastName;
        token.accessTokenExpires = Date.now() + ACCESS_TOKEN_LIFETIME_MS;
        return token;
      }

      // Subsequent calls — check whether the backend access token is still
      // fresh. If not, refresh it here so the NEW token actually lands back
      // in the session (this is the piece that was missing: refreshing
      // inside a Server Action's apiRequestWithRefresh only ever fixed that
      // one request, since it never wrote back into this JWT).
      const expires = (token.accessTokenExpires as number | undefined) ?? 0;
      if (Date.now() < expires - REFRESH_BUFFER_MS) {
        return token; // still valid, nothing to do
      }

      const refreshed = await refreshBackendToken();
      if (!refreshed) {
        // Refresh failed (refresh token itself expired/revoked, or no
        // cookie present) — mark the token as errored. Reads/mutations will
        // still fail, but at least session() below can react to this
        // distinctly from "everything's fine" if you want to redirect to
        // /login on error in the future.
        token.error = "RefreshAccessTokenError";
        return token;
      }

      token.backendToken = refreshed.token;
      token.accessTokenExpires = Date.now() + ACCESS_TOKEN_LIFETIME_MS;
      delete token.error;
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