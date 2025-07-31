"use client";
import DccOptions from "@/components/ui/options";
import ProtectedRoute from "@/components/ProtectedRoute";
import { logout } from "@/utils/auth";

export default function Page() {
  const handleLogout = async () => {
    console.log("🚪 Main page: Initiating logout...");
    
    try {
      // Immediately clear everything locally first
      console.log("🗑️ Main page: Immediate local cleanup...");
      
      if (typeof window !== "undefined") {
        // Clear localStorage immediately
        localStorage.removeItem("access_token");
        localStorage.clear();
        
        // Clear cookies immediately with multiple methods
        const cookieClearCommands = [
          "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax",
          "access_token=; max-age=0; path=/; SameSite=Lax",
          "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/",
          "access_token=; max-age=0; path=/",
        ];
        
        cookieClearCommands.forEach(cmd => {
          document.cookie = cmd;
        });
        
        // Nuclear option - clear all cookies
        document.cookie.split(";").forEach(function(c) { 
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
        });
        
        console.log("✅ Main page: Local cleanup completed");
      }
      
      // Now call the full logout function (which will also redirect)
      await logout();
      
    } catch (error) {
      console.error("❌ Main page: Logout error:", error);
      
      // Emergency fallback - force everything and redirect
      if (typeof window !== "undefined") {
        console.log("🚨 Main page: Emergency logout fallback...");
        
        // Clear everything possible
        localStorage.clear();
        sessionStorage.clear();
        
        // More aggressive cookie clearing
        document.cookie.split(";").forEach(function(c) { 
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
        });
        
        // Force multiple redirect attempts
        setTimeout(() => {
          window.history.replaceState(null, "", "/");
          window.location.href = "/";
        }, 50);
        
        setTimeout(() => {
          if (window.location.pathname !== "/") {
            window.location.replace("/");
          }
        }, 150);
        
        setTimeout(() => {
          if (window.location.pathname !== "/") {
            window.location.reload();
          }
        }, 300);
      }
    }
  };

  return (
    <ProtectedRoute>
      <DccOptions />
    </ProtectedRoute>
  );
}