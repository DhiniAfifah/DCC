"use client";
import { useState, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import axios from "axios";

export const FormSchema = z.object({
  username: z.string(),
  email: z.string().email("Invalid email address"),
  password: z.string(),
});

export default function Register({ formData }: { formData: any }) {
  const { t } = useLanguage();

  const [initialFormData, setInitialFormData] = useState(
    formData || { username: "", email: "", password: "" }
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

  // Fungsi untuk menangani register
  const onSubmit = async (data: { username: string; email: string; password: string }) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/register",
        {
          email: data.email,
          password: data.password,
          full_name: data.username,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      
      // Clear any cached data and redirect to login
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    } catch (error) {
      setErrorMessage(t("register_fail"));
      setIsLoading(false);
    }
  };

  return (
    <FormProvider {...form}>
      <div className="flex flex-col gap-1">
        <Card className="overflow-hidden p-0">
          <CardContent className="grid p-0 md:grid-cols-2">
            <form className="p-6 md:p-8" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col items-center text-center">
                  <h1 className="text-2xl font-bold">{t("welcome")}</h1>
                  <p className="text-muted-foreground text-balance">
                    {t("register_account")}
                  </p>
                </div>
                <div id="username" className="grid gap-1">
                  <FormLabel>{t("nama")}</FormLabel>
                  <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                      <FormItem>
                          <FormControl>
                          <Input {...field} required disabled={isLoading} />
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                      )}
                  />
                </div>
                <div id="email">
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
                <div id="password">
                  <FormLabel>{t("password")}</FormLabel>
                  <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                      <FormItem>
                          <FormControl>
                          <Input {...field} type="password" required disabled={isLoading} />
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                      )}
                  />
                </div>
                <div className="text-center">
                  {errorMessage && <p className="text-red-600"><small>{errorMessage}</small></p>}
                  <Button 
                    variant="green" 
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? "Registering..." : t("register")}
                  </Button>
                </div>
                <div className="text-center text-sm">
                  {t("to_login")}{" "}
                  <a href="/" className="underline underline-offset-4 text-sky-500 hover:text-sky-600">
                    {t("login")}
                  </a>
                </div>
              </div>
            </form>
            <div className="bg-muted relative hidden md:block">
              <img
                src="/image/biologi.jpg"
                alt="Image"
                className="absolute inset-0 h-full w-full object-cover grayscale"
              />
              <div className="absolute inset-0 bg-red-500 opacity-50"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </FormProvider>
  );
}