import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Outfit } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/session-provider";
import { ThemeToggleFloating } from "@/components/theme-toggle-floating";
import { FloatingCartButton } from "@/components/floating-cart-button";
import { CartProvider } from "@/lib/cart-context";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});
const outfit = Outfit({subsets:['latin'],variable:'--font-heading'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Blanche Bridal",
  description: "Smart Bridal Assistance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable, outfit.variable)}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <CartProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <ThemeToggleFloating />
              <FloatingCartButton />
            </ThemeProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}