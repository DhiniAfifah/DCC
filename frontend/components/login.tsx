"use client";
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useLanguage } from "@/context/LanguageContext";
import { z } from "zod";
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import axios from "axios";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export const FormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string(),
});

export default function Login({ formData }: { formData: any }) {
  const { t } = useLanguage();

  const [initialFormData, setInitialFormData] = useState(
    formData || { email: "", password: "" }
  );

  useEffect(() => {
    setInitialFormData(formData);
  }, [formData]);

  const form = useForm({
    resolver: zodResolver(FormSchema),
    mode: "onChange",
    defaultValues: initialFormData,
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Enhanced login function with better cookie handling
  const onSubmit = async (data: { email: string; password: string }) => {
    console.log("🚀 Login attempt started for:", data.email);
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const formData = new URLSearchParams();
      formData.append("username", data.email);
      formData.append("password", data.password);
      
      console.log("📡 Sending login request...");
      const response = await axios.post(
        "http://127.0.0.1:8000/token",
        formData.toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          withCredentials: true, // This ensures cookies are included
        }
      );

      console.log("✅ Login response received:", response.status);
      
      if (response.data.access_token) {
        // Store token in localStorage
        localStorage.setItem("access_token", response.data.access_token);
        console.log("💾 Token stored in localStorage");

        // Also manually set the cookie to ensure it's available immediately
        const expires = new Date();
        expires.setDate(expires.getDate() + 7); // 7 days
        document.cookie = `access_token=${response.data.access_token}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
        console.log("🍪 Cookie set manually");

        // Verify both storages
        const storedToken = localStorage.getItem("access_token");
        const cookieToken = document.cookie.includes("access_token=");
        
        console.log("✅ Token verification:");
        console.log("  - localStorage:", storedToken ? "STORED" : "MISSING");
        console.log("  - Cookie:", cookieToken ? "SET" : "MISSING");
        
        if (storedToken) {
          console.log("🔄 Redirecting to /main...");
          // Use router.push instead of window.location for better Next.js navigation
          window.location.href = "/main";
        } else {
          throw new Error("Failed to store token");
        }
      } else {
        throw new Error("No access token in response");
      }

    } catch (error: any) {
      console.error("❌ Login error:", error);
      console.error("📋 Error response:", error.response?.data);
      console.error("📋 Error status:", error.response?.status);
      
      // Clear any potentially corrupted data
      localStorage.removeItem("access_token");
      document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax";
      
      setErrorMessage(error.response?.data?.detail || t("login_fail"));
      setIsLoading(false);
    }
  };
  
  return (
    <FormProvider {...form}>
      <div className="flex flex-col gap-6">
        <Card className="overflow-hidden p-0">
          <CardContent className="grid p-0 md:grid-cols-2">
            <div className="bg-muted relative hidden md:block">
              <img
                src="/image/panjang.jpg"
                alt="Image"
                className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
              />
              <div className="absolute inset-0 bg-red-500 opacity-50"></div>
            </div>
            <form className="p-6 md:p-8" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center text-center">
                  <h1 className="text-2xl font-bold">{t("welcome_back")}</h1>
                  <p className="text-muted-foreground text-balance">
                    {t("log_in")}
                  </p>
                </div>
                <div id="email" className="grid gap-1">
                  <FormLabel>{t("email")}</FormLabel>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input {...field} type="email" required disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div id="password" className="grid gap-1">
                  <FormLabel>{t("password")}</FormLabel>
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input {...field} type="password" disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="text-center">
                  {errorMessage && (
                    <p className="text-red-600 mb-4">
                      <small>{errorMessage}</small>
                    </p>
                  )}
                  <Button 
                    variant="green" 
                    type="submit"
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? "Logging in..." : t("login")}
                  </Button>
                </div>
                <div className="text-center text-sm">
                  {t("to_register")}{" "}
                  <a href="/register" className="underline underline-offset-4 text-sky-500 hover:text-sky-600">
                    {t("register")}
                  </a>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </FormProvider>
  );
}