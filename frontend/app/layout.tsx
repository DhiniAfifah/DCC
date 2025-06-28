import Navbar from "@/components/navbar";
import "./globals.css";
import type { Metadata } from "next";
import type React from "react";
import { LanguageProvider } from '@/context/LanguageContext';
import AxiosSetup from '@/components/AxiosSetup';

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
          <AxiosSetup />
          <Navbar />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
