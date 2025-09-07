"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getToken, verifyToken } from "@/utils/auth";
import { useLanguage } from '@/context/LanguageContext';
import { Button } from "@/components/ui/button";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const checkAuth = async () => {
      console.log("🔐 ProtectedRoute: Starting auth check...");
      setIsLoading(true);

      try {
        // Get token using our improved function
        const token = getToken();
        
        if (!token) {
          console.log("❌ ProtectedRoute: No token found, redirecting to login");
          throw new Error("No token found");
        }

        console.log("🔍 ProtectedRoute: Verifying token...");
        const isValid = verifyToken(token);
        
        if (isValid) {
          console.log("✅ ProtectedRoute: Token is valid, checking with server...");
          
          // Double-check with server
          try {
            const response = await fetch("http://127.0.0.1:8000/users/me/", {
              method: "GET",
              headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              credentials: "include",
            });

            console.log("📡 ProtectedRoute: Server response status:", response.status);

            if (response.ok) {
              console.log("✅ ProtectedRoute: Server authentication successful");
              setIsAuthenticated(true);
            } else if (response.status === 401) {
              console.log("❌ ProtectedRoute: Server rejected token (401)");
              throw new Error("Token rejected by server");
            } else {
              console.log("⚠️ ProtectedRoute: Server error, but token seems valid locally");
              // If server is down but token is valid, allow access
              setIsAuthenticated(true);
            }
          } catch (serverError) {
            console.error("🌐 ProtectedRoute: Server check failed:", serverError);
            // If server is unreachable but token is valid, allow access
            console.log("⚠️ ProtectedRoute: Server unreachable, trusting local token validation");
            setIsAuthenticated(true);
          }
        } else {
          console.log("❌ ProtectedRoute: Token validation failed");
          throw new Error("Token invalid");
        }
      } catch (error) {
        console.error("❌ ProtectedRoute: Authentication check failed:", error);
        
        // Clear all authentication data
        localStorage.removeItem("access_token");
        document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax";
        
        console.log("🔄 ProtectedRoute: Redirecting to login...");
        
        // Use setTimeout to ensure this runs after current execution context
        setTimeout(() => {
          window.location.href = "/";
        }, 100);
        return;
      } finally {
        setIsLoading(false);
      }
    };

    // Run auth check
    checkAuth();

    // Check auth every 5 minutes
    const interval = setInterval(checkAuth, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [router]);

  if (isLoading) {
    console.log("⏳ ProtectedRoute: Showing loading screen");
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">{t("verify_session")}...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log("🚫 ProtectedRoute: Showing access denied (this should not show if redirect works)");
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">{t("access_denied")}</h1>
          <p className="text-gray-600 mt-2">{t("permission")}</p>
          <Button
            onClick={() => {
              console.log("🔄 ProtectedRoute: Manual redirect to login");
              window.location.href = "/";
            }}
            className="mt-4 px-4 py-2"
            variant="blue"
          >
            {t("back_to_login")}
          </Button>
        </div>
      </div>
    );
  }

  console.log("✅ ProtectedRoute: Rendering protected content");
  return <>{children}</>;
}