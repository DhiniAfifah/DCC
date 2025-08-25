"use client";
import Login from "@/components/login";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, verifyToken } from "@/utils/auth";
import { useLanguage } from '@/context/LanguageContext';

export default function LoginPage() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const checkExistingAuth = () => {
      console.log("🔍 LoginPage: Checking existing authentication...");
      
      const token = getToken();
      console.log("🔑 LoginPage: Token found:", token ? "YES" : "NO");

      if (token && verifyToken(token)) {
        console.log("✅ LoginPage: Valid token found, redirecting to /home");
        // Use window.location.href for immediate redirect
        window.location.href = "/home";
        return;
      } else {
        console.log("❌ LoginPage: No valid token, staying on login page");
        // Clear any invalid tokens
        if (token) {
          localStorage.removeItem("access_token");
          document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax";
        }
      }
      
      setIsCheckingAuth(false);
    };

    // Add a small delay to ensure cookies are set if coming from a redirect
    setTimeout(checkExistingAuth, 100);
  }, [router]);

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-indigo-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t("authentication")}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-white to-indigo-200 flex min-h-svh flex-col items-center justify-center pt-20">
      <div className="w-full max-w-sm md:max-w-3xl">
        <Login formData={{ email: "", password: "" }} />
      </div>
    </div>
  );
}