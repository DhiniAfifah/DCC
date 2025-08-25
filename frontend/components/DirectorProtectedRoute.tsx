"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getToken, verifyToken, isDirector, getUserRole } from "@/utils/auth";
import { useLanguage } from '@/context/LanguageContext';
import { Button } from "@/components/ui/button";

export default function DirectorProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const checkDirectorAuth = async () => {
      console.log("🎯 DirectorProtectedRoute: Starting director auth check...");
      setIsLoading(true);

      try {
        // Get token using our improved function
        const token = getToken();
        
        if (!token) {
          console.log("❌ DirectorProtectedRoute: No token found, redirecting to login");
          throw new Error("No token found");
        }

        console.log("🔍 DirectorProtectedRoute: Verifying token...");
        const isValid = verifyToken(token);
        
        if (!isValid) {
          console.log("❌ DirectorProtectedRoute: Token invalid");
          throw new Error("Token invalid");
        }

        // Check if user is director
        const userRole = getUserRole();
        console.log("👤 DirectorProtectedRoute: User role:", userRole);
        
        if (userRole !== "director") {
          console.log("🚫 DirectorProtectedRoute: User is not director");
          return;
        }

        console.log("✅ DirectorProtectedRoute: User is director, checking with server...");
        
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

          console.log("📡 DirectorProtectedRoute: Server response status:", response.status);
          console.log("📋 DirectorProtectedRoute: Response headers:", Object.fromEntries(response.headers.entries()));

          if (response.ok) {
            const userData = await response.json();
            console.log("✅ DirectorProtectedRoute: Server authentication successful, role:", userData.role);
            
            if (userData.role === "director") {
              setIsAuthorized(true);
            } else {
              console.log("🚫 DirectorProtectedRoute: Server confirms user is not director");
              throw new Error("Not a director");
            }
          } else if (response.status === 401) {
            console.log("❌ DirectorProtectedRoute: Server rejected token (401)");
            const errorText = await response.text();
            console.log("📝 Error response:", errorText);
            throw new Error("Token rejected by server");
          } else if (response.status === 403) {
            console.log("🚫 DirectorProtectedRoute: Server denied access (403)");
            // Redirect to home page for non-directors
            setTimeout(() => {
              window.location.href = "/home";
            }, 100);
            return;
          } else {
            console.log("⚠️ DirectorProtectedRoute: Server error, but token seems valid locally");
            console.log("📝 Response text:", await response.text());
            // If server is down but token is valid and role is director, allow access
            if (isDirector()) {
              setIsAuthorized(true);
            } else {
              throw new Error("Not authorized");
            }
          }
        } catch (serverError) {
          console.error("🌐 DirectorProtectedRoute: Server check failed:", serverError);
          
          // Check if it's a network error vs auth error
          if (serverError instanceof TypeError && serverError.message === "Failed to fetch") {
            console.log("🌐 Network error detected, checking local token validation");
            // If server is unreachable but token is valid and role is director, allow access
            if (isDirector()) {
              console.log("⚠️ DirectorProtectedRoute: Server unreachable, trusting local token validation");
              setIsAuthorized(true);
            } else {
              throw new Error("Server unreachable and not director");
            }
          } else {
            // Re-throw other errors
            throw serverError;
          }
        }
      } catch (error) {
        console.error("❌ DirectorProtectedRoute: Authorization check failed:", error);
        
        // Clear all authentication data
        localStorage.removeItem("access_token");
        document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax";
        
        console.log("🔄 DirectorProtectedRoute: Redirecting to login...");
        
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
    checkDirectorAuth();

    // Check auth every 5 minutes
    const interval = setInterval(checkDirectorAuth, 5 * 60 * 1000);

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
    console.log("⏳ DirectorProtectedRoute: Showing loading screen");
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">{t("verify_director")}...</p>
          {/* Debug button for testing CORS */}
          <button 
            onClick={testCORS}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded text-sm"
          >
            Test CORS
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    console.log("🚫 DirectorProtectedRoute: Showing access denied");
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">{t("access_denied")}</h1>
          <p className="text-gray-600 mt-2">{t("DirectorProtectedRoute")}</p>
          <Button
            onClick={() => {
              console.log("🔄 DirectorProtectedRoute: Manual redirect to home");
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

  console.log("✅ DirectorProtectedRoute: Rendering director content");
  return <>{children}</>;
}