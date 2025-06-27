"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { verifyToken } from "@/utils/auth";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);

      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          throw new Error("No token found");
        }

        const isValid = verifyToken(token);

        if (isValid) {
          setIsAuthenticated(true);
        } else {
          const response = await fetch("http://127.0.0.1:8000/verify-token", {
            method: "GET",
            credentials: "include",
          });

          if (response.ok) {
            setIsAuthenticated(true);
          } else {
            throw new Error("Token invalid");
          }
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        localStorage.removeItem("access_token");
        // GUNAKAN WINDOW.LOCATION UNTUK REDIRECT FULL PAGE
        window.location.href = "/";
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    const interval = setInterval(checkAuth, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memverifikasi sesi...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Akses Ditolak</h1>
          <p className="text-gray-600 mt-2">
            Anda tidak memiliki izin untuk mengakses halaman ini.
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            Kembali ke Login
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
