import ClientNavbarWrapper from "@/components/ClientNavbarWrapper";
import "./globals.css";
import type { Metadata } from "next";
import type React from "react";
import { LanguageProvider } from '@/context/LanguageContext';
import { Toaster } from "@/components/ui/sonner"

export const metadata: Metadata = {
  title: "DiCCA",
  description: "Create and manage DCCs with BSN",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          <ClientNavbarWrapper />
          <main>{children}</main>
          <Toaster position="top-center" richColors />
        </LanguageProvider>
      </body>
    </html>
  );
}
