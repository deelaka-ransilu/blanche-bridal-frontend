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

// Reads the real expiry from the token itself instead of guessing,
// so this never drifts out of sync with the backend's actual expiry.
function getTokenExpiry(token: string): number {
  try {
    const payload = decodeJwtPayload(token);
    const exp = payload.exp as number | undefined;
    if (typeof exp === "number") return exp * 1000;
  } catch {
    // unreadable token, fall back below
  }
  return Date.now() + 60 * 1000;
}

const REFRESH_BUFFER_MS = 60 * 1000;

// Takes raw Set-Cookie header strings from the backend response and
// writes them into this request's own cookie jar.
// Only works inside Server Actions / Route Handlers / Middleware —
// throws if called during a plain Server Component render.
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

// Calls the backend to get a new access token using the refreshToken
// cookie already in the browser. Cookie-forwarding failures are kept
// separate from network failures — a failed cookie write here doesn't
// mean the refresh itself failed.
async function refreshBackendToken(): Promise<{ token: string } | null> {
  let cookieStore: Awaited<ReturnType<typeof cookies>> | null = null;
  try {
    cookieStore = await cookies();
  } catch {
    // no cookie access in this context, continue without it
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
    return null; // real network failure
  }

  if (cookieStore) {
    try {
      const setCookies = res.headers.getSetCookie?.() ?? [];
      forwardSetCookies(cookieStore, setCookies);
    } catch {
      // expected in Server Component render context, not fatal
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

// Prevents multiple parallel requests from each trying to refresh the
// same expired token at once (the backend only accepts one refresh
// attempt per token, so extra ones fail with 401).
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
      authorization: {
        params: {
          prompt: "select_account", // always show account picker
        },
      },
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
      // Google login: exchange Google's id_token with our own backend
      // to get our own JWT, same as a normal login would.
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
          // should not normally happen here, stay defensive
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
      // First run after login: just store what we got.
      if (user) {
        token.role = (user as any).role;
        token.backendToken = (user as any).backendToken;
        token.email = (user as any).email;
        token.firstName = (user as any).firstName;
        token.lastName = (user as any).lastName;
        token.accessTokenExpires = getTokenExpiry((user as any).backendToken);
        return token;
      }

      // Still fresh, nothing to do.
      const expires = (token.accessTokenExpires as number | undefined) ?? 0;
      if (Date.now() < expires - REFRESH_BUFFER_MS) {
        return token;
      }

      // Expired (or close to it): refresh.
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

        // let pages know if refresh failed, so they can force a sign-out
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