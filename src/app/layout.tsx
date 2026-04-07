import type { Metadata } from "next";
import { Lora } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/shared/SessionProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Blanche Bridal",
  description: "Blanche Bridal Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${lora.variable} antialiased font-[family-name:var(--font-lora)]`}
      >
        <SessionProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </SessionProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
