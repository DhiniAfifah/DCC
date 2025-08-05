import ClientNavbarWrapper from "@/components/ClientNavbarWrapper";
import "./globals.css";
import type { Metadata } from "next";
import type React from "react";
import { LanguageProvider } from '@/context/LanguageContext';

export const metadata: Metadata = {
  title: "BSN DCC",
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
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
