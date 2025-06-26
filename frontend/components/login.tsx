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
import Link from "next/link";

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

  // Fungsi untuk menangani login
  const onSubmit = async (data: { email: string; password: string }) => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/token",
        `email=${data.email}&password=${data.password}`,
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );
      localStorage.setItem("access_token", response.data.access_token);
      window.location.href = "/main";
    } catch (error) {
      setErrorMessage(t("login_fail"));
    }
  };
  
  return (
    <FormProvider {...form}>
      <div className="flex flex-col gap-6">
        <Card className="overflow-hidden p-0">
          <CardContent className="grid p-0 md:grid-cols-2">
            <form className="p-6 md:p-8">
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
                          <Input 
                            {...field} type="email" required
                          />
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
                          <Input {...field} type="password"  />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="text-center">
                  {errorMessage && <p className="text-red-600"><small>{errorMessage}</small></p>}
                  <Link href="/">
                    <Button variant="green" onClick={form.handleSubmit(onSubmit)}>
                      {t("login")}
                    </Button>
                  </Link>
                </div>
                <div className="text-center text-sm">
                  {t("to_register")}{" "}
                  <a href="/register" className="underline underline-offset-4 text-sky-500 hover:text-sky-600">
                    {t("register")}
                  </a>
                </div>
              </div>
            </form>
            <div className="bg-muted relative hidden md:block">
              <img
                src="/image/panjang.jpg"
                alt="Image"
                className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
              />
              <div className="absolute inset-0 bg-red-500 opacity-50"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </FormProvider>
  );
}