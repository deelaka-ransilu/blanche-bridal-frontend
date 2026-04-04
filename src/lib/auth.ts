import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import { login } from "@/lib/api/auth";

export const authOptions: NextAuthOptions = {
  providers: [
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

          if (!res.success || !res.data) return null;

          // Return object that NextAuth will store in the JWT
          return {
            id: credentials.email,
            email: credentials.email,
            role: res.data.role,
            backendToken: res.data.token,
          };
        } catch {
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // On first sign in, user object is available — store role + backendToken
      if (user) {
        token.role = (user as any).role;
        token.backendToken = (user as any).backendToken;
        token.email = (user as any).email;
      }
      return token;
    },

    async session({ session, token }) {
      // Make role + backendToken available in useSession()
      if (token) {
        session.user.role = token.role as string;
        session.user.backendToken = token.backendToken as string;
        session.user.email = token.email as string;
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
    maxAge: 24 * 60 * 60, // 24 hours — matches your backend JWT expiry
  },

  secret: process.env.NEXTAUTH_SECRET,
};
