import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";
import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

function decodeJwtPayload(token: string): Record<string, unknown> {
  const payload = token.split(".")[1];
  const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  return JSON.parse(Buffer.from(padded, "base64").toString("utf-8"));
}

/**
 * Reads the token's own `exp` claim (seconds since epoch, per JWT spec) and
 * converts it to a millisecond timestamp. This is the SOURCE OF TRUTH for
 * when the backend will actually reject this token — previously we used a
 * hardcoded ACCESS_TOKEN_LIFETIME_MS constant here, which silently drifted
 * out of sync with the backend's real jwt.expiration (see CURRENT_STATE.md:
 * this caused middleware to report `stale=false` right up until the
 * backend had already been rejecting the token for a minute).
 * Falls back to a conservative default only if the token is somehow
 * unparseable/missing exp, so we never divide-by-zero into an infinite
 * "fresh" state.
 */
function getTokenExpiry(token: string): number {
  try {
    const payload = decodeJwtPayload(token);
    const exp = payload.exp as number | undefined;
    if (typeof exp === "number") return exp * 1000;
  } catch {
    // fall through to default below
  }
  return Date.now() + 60 * 1000; // conservative 60s fallback, forces a near-term refresh attempt rather than trusting a token we couldn't read
}

const REFRESH_BUFFER_MS = 60 * 1000;

/**
 * Forwards a set of raw Set-Cookie header strings into the current request's
 * outgoing cookie jar via next/headers, preserving Max-Age.
 *
 * IMPORTANT: this throws when called during a Server Component render
 * (Next.js only allows cookie writes in Server Actions / Route Handlers /
 * Middleware). Callers MUST wrap this separately from the "did the network
 * call succeed" logic — see refreshBackendToken() below. Previously this was
 * inside the same try/catch as the fetch itself, so a cookie-write failure
 * here was indistinguishable from the backend rejecting the refresh token,
 * which incorrectly set RefreshAccessTokenError on a successful refresh and
 * caused the repeated-401 loop seen in production logs.
 */
function forwardSetCookies(cookieStore: Awaited<ReturnType<typeof cookies>>, setCookies: string[]) {
  for (const cookie of setCookies) {
    const parts = cookie.split(";").map((p) => p.trim());
    const [nameValue, ...attrs] = parts;
    const [name, value] = nameValue.split("=");
    if (!name || !value) continue;

    const maxAgeAttr = attrs.find((a) => a.toLowerCase().startsWith("max-age="));
    const maxAge = maxAgeAttr ? parseInt(maxAgeAttr.split("=")[1], 10) : undefined;

    cookieStore.set(name, decodeURIComponent(value), {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      ...(maxAge !== undefined && !Number.isNaN(maxAge) ? { maxAge } : {}),
    });
  }
}

/**
 * Calls the backend's POST /api/auth/refresh using the httpOnly refreshToken
 * cookie already present in the browser.
 *
 * Cookie-forwarding is now isolated in its own try/catch. If it throws
 * (Server Component render context), we still return the new access token so
 * the in-memory JWT for THIS request/render gets updated — the browser's
 * refreshToken cookie just won't be rotated on this particular call.
 * middleware.ts is responsible for keeping that cookie fresh proactively
 * before Server Components ever run, so this path becoming a no-op cookie
 * write is expected and fine, not an error state.
 */
async function refreshBackendToken(): Promise<{ token: string } | null> {
  let cookieStore: Awaited<ReturnType<typeof cookies>> | null = null;
  try {
    cookieStore = await cookies();
  } catch {
    // cookies() itself can throw in some contexts too — proceed without it,
    // we can still attempt the network call using whatever the current
    // request's cookie header already is (fetch below will just fail auth
    // if there truly is no cookie access at all, which is fine — surfaces
    // as a null return like any other failure).
  }

  let cookieHeader = "";
  try {
    cookieHeader = cookieStore ? cookieStore.toString() : "";
  } catch {
    cookieHeader = "";
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { Cookie: cookieHeader },
    });
  } catch {
    // Actual network failure — this IS a real refresh failure.
    return null;
  }

  // Cookie forwarding is best-effort and isolated from the result below.
  if (cookieStore) {
    try {
      const setCookies = res.headers.getSetCookie?.() ?? [];
      forwardSetCookies(cookieStore, setCookies);
    } catch {
      // Expected when called from a Server Component render. middleware.ts
      // keeps the browser's refreshToken cookie fresh independently, so
      // this is not fatal — do NOT return null here.
    }
  }

  if (!res.ok) return null;

  try {
    const body = await res.json();
    if (!body?.success || !body?.data?.token) return null;
    return { token: body.data.token as string };
  } catch {
    return null;
  }
}

/**
 * De-dupes concurrent refresh attempts within this process. A single
 * dashboard load fans out into several parallel Server Component /
 * server-action calls, all of which can detect the same expired
 * backendToken at nearly the same instant. Without this, each one
 * independently calls refreshBackendToken() using the same (single-use)
 * refresh token cookie — the backend rotates it on the first request that
 * arrives, so every other concurrent caller gets rejected with
 * "Invalid refresh token" (seen as a burst of 401s / UnauthorizedException
 * in the backend logs, all within the same few milliseconds).
 *
 * Keyed by the token being refreshed, so unrelated sessions never block
 * each other, but N parallel requests refreshing the SAME expired token
 * collapse into a single backend call — every caller awaits that one
 * in-flight promise instead of racing for the same refresh token.
 *
 * Note: this only fully solves the race within a single Node process
 * (fine for local dev / a single-instance deployment). A multi-instance
 * deployment behind a load balancer would need this de-dup to live in a
 * shared store (e.g. Redis) instead of an in-memory Map.
 */
const refreshPromises = new Map<string, Promise<{ token: string } | null>>();

async function refreshBackendTokenDeduped(currentToken: string): Promise<{ token: string } | null> {
  const existing = refreshPromises.get(currentToken);
  if (existing) return existing;

  const promise = refreshBackendToken().finally(() => {
    refreshPromises.delete(currentToken);
  });

  refreshPromises.set(currentToken, promise);
  return promise;
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
        const backendRes = await fetch(`${API_URL}/api/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ googleToken: account.id_token }),
        });

        const setCookies = backendRes.headers.getSetCookie?.() ?? [];
        try {
          const cookieStore = await cookies();
          forwardSetCookies(cookieStore, setCookies);
        } catch {
          // signIn callback runs in a real request context during OAuth
          // flow, so this should normally succeed — but stay defensive.
        }

        const res = await backendRes.json();

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
      if (user) {
        token.role = (user as any).role;
        token.backendToken = (user as any).backendToken;
        token.email = (user as any).email;
        token.firstName = (user as any).firstName;
        token.lastName = (user as any).lastName;
        token.accessTokenExpires = getTokenExpiry((user as any).backendToken);
        return token;
      }

      const expires = (token.accessTokenExpires as number | undefined) ?? 0;
      if (Date.now() < expires - REFRESH_BUFFER_MS) {
        return token;
      }

      const refreshed = await refreshBackendTokenDeduped(token.backendToken as string);
      if (!refreshed) {
        token.error = "RefreshAccessTokenError";
        return token;
      }

      token.backendToken = refreshed.token;
      token.accessTokenExpires = getTokenExpiry(refreshed.token);
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

        // Surface refresh failure to the client so pages can react
        // (e.g. force sign-out) instead of silently retrying forever.
        if (token.error) {
          (session as any).error = token.error;
        }
      }
      return session;
    },
  },
  pages: { signIn: "/login", error: "/login" },
  session: { strategy: "jwt", maxAge: 24 * 60 * 60 },
  secret: process.env.NEXTAUTH_SECRET,
};