import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  exp: number;
  sub: string;
  role?: string;
}

export const verifyToken = (token: string): boolean => {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    const currentTime = Date.now() / 1000;

    if (decoded.exp < currentTime) {
      console.log("🕐 Token expired");
      return false;
    }

    console.log("✅ Token is valid");
    return true;
  } catch (error) {
    console.error("❌ Token verification failed:", error);
    return false;
  }
};

// Get user role from token
export const getUserRole = (): string | null => {
  const token = getToken();
  if (!token) return null;

  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded.role || "user";
  } catch (error) {
    console.error("❌ Failed to decode role from token:", error);
    return null;
  }
};

// Check if current user is officer
export const isOfficer = (): boolean => {
  const role = getUserRole();
  return role === "director" || role === "head";
};

// Check if current user is director
export const isDirector = (): boolean => {
  const role = getUserRole();
  console.log("User role:", role);
  return role === "director";
};

// Check if current user is lab head
export const isHead = (): boolean => {
  const role = getUserRole();
  console.log("User role:", role);
  return role === "head";
};

// Get token from cookies first (for persistent auth), then localStorage as fallback
export const getToken = (): string | null => {
  if (typeof window !== "undefined") {
    // First try cookies (persistent across sessions)
    const cookieToken = getCookieValue("access_token");
    if (cookieToken && cookieToken.trim() !== "" && cookieToken !== "undefined" && cookieToken !== "null") {
      console.log("🍪 Token found in cookies (persistent)");
      // Sync to localStorage for consistency
      localStorage.setItem("access_token", cookieToken);
      return cookieToken;
    }

    // Fallback to localStorage (session-based)
    const localStorageToken = localStorage.getItem("access_token");
    if (localStorageToken && localStorageToken.trim() !== "" && localStorageToken !== "undefined" && localStorageToken !== "null") {
      console.log("🔒 Token found in localStorage");
      return localStorageToken;
    }

    console.log("❌ No valid token found");
  }
  return null;
};

// Helper function to get cookie value
const getCookieValue = (name: string): string | null => {
  if (typeof document !== "undefined") {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
  }
  return null;
};

// Enhanced logout with immediate token clearing
export const logout = async (): Promise<void> => {
  if (typeof window !== "undefined") {
    console.log("🚪 Starting enhanced logout process...");
    
    // STEP 1: Immediately clear all local storage
    console.log("🗑️ Step 1: Clearing localStorage...");
    localStorage.removeItem("access_token");
    localStorage.clear(); // Clear everything to be sure

    // STEP 2: Aggressively clear ALL cookies
    console.log("🍪 Step 2: Aggressively clearing cookies...");
    
    // Method 1: Clear specific cookie with various domain/path combinations
    const clearCookieVariations = [
      "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax",
      "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax; domain=localhost",
      "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax; domain=127.0.0.1",
      "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax; domain=.localhost",
      "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/",
      "access_token=; max-age=0; path=/; SameSite=Lax",
      "access_token=; max-age=0; path=/",
      "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure=false",
    ];

    clearCookieVariations.forEach(cookieString => {
      document.cookie = cookieString;
    });

    // Method 2: Clear ALL cookies (nuclear option)
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });

    console.log("🍪 Cookies cleared with multiple methods");

    // STEP 3: Try backend logout (but don't wait for it)
    console.log("📡 Step 3: Calling backend logout...");
    try {
      fetch("http://127.0.0.1:8000/logout", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }).then(response => {
        console.log("✅ Backend logout response:", response.status);
      }).catch(error => {
        console.error("⚠️ Backend logout failed:", error);
      });
    } catch (error) {
      console.error("⚠️ Backend logout error:", error);
    }

    // STEP 4: Verify everything is cleared
    console.log("🔍 Step 4: Verifying clearance...");
    const remainingLocalStorage = localStorage.getItem("access_token");
    const remainingCookie = getCookieValue("access_token");
    
    console.log("Verification results:");
    console.log("  - localStorage token:", remainingLocalStorage ? "STILL PRESENT" : "CLEARED");
    console.log("  - Cookie token:", remainingCookie ? "STILL PRESENT" : "CLEARED");

    // STEP 5: Force redirect immediately
    console.log("🔄 Step 5: Force redirect to login...");
    
    // Use multiple redirect methods to ensure it works
    try {
      // Method 1: Replace current history entry
      window.history.replaceState(null, "", "/");
      
      // Method 2: Force location change
      window.location.href = "/";
      
      // Method 3: Backup - reload after short delay if others fail
      setTimeout(() => {
        if (window.location.pathname !== "/") {
          console.log("🔄 Backup redirect triggered");
          window.location.replace("/");
        }
      }, 100);
      
    } catch (error) {
      console.error("❌ Redirect failed:", error);
      // Final fallback
      setTimeout(() => {
        window.location.reload();
      }, 200);
    }
  }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const token = getToken();
  return token ? verifyToken(token) : false;
};

export const getAccessToken = (): string | undefined => {
  return document.cookie
    .split('; ')
    .find(row => row.startsWith('access_token='))
    ?.split('=')[1];
};