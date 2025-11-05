"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getToken, verifyToken, isOfficer, getUserRole } from "@/utils/auth";
import { useLanguage } from '@/context/LanguageContext';
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner"

export default function OfficerProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const checkOfficerAuth = async () => {
      console.log("🎯 OfficerProtectedRoute: Starting officer auth check...");
      setIsLoading(true);

      try {
        // Get token using our improved function
        const token = getToken();
        
        if (!token) {
          console.log("❌ OfficerProtectedRoute: No token found, redirecting to login");
          throw new Error("No token found");
        }

        console.log("🔍 OfficerProtectedRoute: Verifying token...");
        const isValid = verifyToken(token);
        
        if (!isValid) {
          console.log("❌ OfficerProtectedRoute: Token invalid");
          throw new Error("Token invalid");
        }

        // Check if user is officer
        const userRole = getUserRole();
        console.log("👤 OfficerProtectedRoute: User role:", userRole);
        
        if (userRole !== "director" && userRole !== "head") {
          console.log("🚫 OfficerProtectedRoute: User is not officer");
          return;
        }

        console.log("✅ OfficerProtectedRoute: User is officer, checking with server...");
        
        // FIXED: Double-check with server using proper headers
        try {
          console.log("🔐 Making request with token:", token.substring(0, 20) + "...");
          
          const response = await fetch("http://127.0.0.1:8000/users/me/", {
            method: "GET",
            headers: {
              // CRITICAL: Use uppercase 'Authorization' (case-sensitive)
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
              "Accept": "application/json",
            },
            credentials: "include",
            mode: "cors", // Explicitly set CORS mode
          });

          console.log("📡 OfficerProtectedRoute: Server response status:", response.status);
          console.log("📋 OfficerProtectedRoute: Response headers:", Object.fromEntries(response.headers.entries()));

          if (response.ok) {
            const userData = await response.json();
            console.log("✅ OfficerProtectedRoute: Server authentication successful, role:", userData.role);
            
            if (userData.role === "director" || userData.role === "head") {
              setIsAuthorized(true);
            } else {
              console.log("🚫 OfficerProtectedRoute: Server confirms user is not officer");
              throw new Error("Not an officer");
            }
          } else if (response.status === 401) {
            console.log("❌ OfficerProtectedRoute: Server rejected token (401)");
            const errorText = await response.text();
            console.log("📝 Error response:", errorText);
            throw new Error("Token rejected by server");
          } else if (response.status === 403) {
            console.log("🚫 OfficerProtectedRoute: Server denied access (403)");
            // Redirect to home page for non-officers
            setTimeout(() => {
              window.location.href = "/home";
            }, 100);
            return;
          } else {
            console.log("⚠️ OfficerProtectedRoute: Server error, but token seems valid locally");
            console.log("📝 Response text:", await response.text());
            // If server is down but token is valid and role is officer, allow access
            if (isOfficer()) {
              setIsAuthorized(true);
            } else {
              throw new Error("Not authorized");
            }
          }
        } catch (serverError) {
          console.error("🌐 OfficerProtectedRoute: Server check failed:", serverError);
          
          // Check if it's a network error vs auth error
          if (serverError instanceof TypeError && serverError.message === "Failed to fetch") {
            console.log("🌐 Network error detected, checking local token validation");
            // If server is unreachable but token is valid and role is officer, allow access
            if (isOfficer()) {
              console.log("⚠️ OfficerProtectedRoute: Server unreachable, trusting local token validation");
              setIsAuthorized(true);
            } else {
              throw new Error("Server unreachable and not officer");
            }
          } else {
            // Re-throw other errors
            throw serverError;
          }
        }
      } catch (error) {
        console.error("❌ OfficerProtectedRoute: Authorization check failed:", error);
        
        // Clear all authentication data
        localStorage.removeItem("access_token");
        document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax";
        
        console.log("🔄 OfficerProtectedRoute: Redirecting to login...");
        
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
    checkOfficerAuth();

    // Check auth every 5 minutes
    const interval = setInterval(checkOfficerAuth, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [router]);

  // Test CORS endpoint
  const testCORS = async () => {
    try {
      console.log("🧪 Testing CORS...");
      const response = await fetch("http://127.0.0.1:8000/cors-test", {
        method: "GET",
        credentials: "include",
        mode: "cors",
      });
      console.log("✅ CORS test successful:", await response.json());
    } catch (error) {
      console.error("❌ CORS test failed:", error);
    }
  };

  if (isLoading) {
    console.log("⏳ OfficerProtectedRoute: Showing loading screen");
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center text-gray-600">
          <Spinner className="h-12 w-12 mx-auto stroke-[1]" />
          <p className="mt-4">{t("verify_officer")}...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    console.log("🚫 OfficerProtectedRoute: Showing access denied");
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">{t("access_denied")}</h1>
          <p className="text-gray-600 mt-2">{t("OfficerProtectedRoute")}</p>
          <Button
            onClick={() => {
              console.log("🔄 OfficerProtectedRoute: Manual redirect to home");
              window.location.href = "/home";
            }}
            variant="green"
            className="mt-3"
          >
            {t("back_to_home")}
          </Button>
        </div>
      </div>
    );
  }

  console.log("✅ OfficerProtectedRoute: Rendering officer content");
  return <>{children}</>;
}