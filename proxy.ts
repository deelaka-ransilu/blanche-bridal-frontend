import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdmin = req.nextUrl.pathname.startsWith("/admin");

    if (isAdmin && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  },
  {
    pages: {
      signIn: "/login",
    },
  },
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/orders/:path*",
    "/appointments/:path*",
    "/rentals/:path*",
    "/cart/:path*",
    "/checkout/:path*",
    "/profile/:path*",
    "/receipts/:path*",
  ],
};
