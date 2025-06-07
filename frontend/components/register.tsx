"use client";
import { useState, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
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

  // Fungsi untuk menangani login
  const onSubmit = async (data: { username: string; email: string; password: string }) => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/token",
        `username=${data.username}&email=${data.email}&password=${data.password}`,
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );
      localStorage.setItem("access_token", response.data.access_token);
      window.location.href = "/";
    } catch (error) {
      setErrorMessage(t("register_fail"));
    }
  };

  return (
    <FormProvider {...form}>
        <div className="flex min-h-screen">
            <div className="w-1/2 flex items-center justify-center pt-20">
                <div className="w-[350px] p-6 space-y-12">
                    <div className="text-center font-semibold leading-tight tracking-tight text-indigo-950 text-2xl">
                        {t("register_account")}
                    </div>
                    
                    <div className="space-y-4">
                        <div id="username">
                        <FormLabel>{t("nama")}</FormLabel>
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                <Input {...field} />
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
                                <Input {...field} />
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
                                <Input {...field} type="password" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        </div>
                        {errorMessage && <p className="text-red-600"><small>{errorMessage}</small></p>}
                    </div>
                    
                    <div className="flex justify-center pt-2">
                        <Link href="/">
                            <Button variant="green" onClick={form.handleSubmit(onSubmit)}>
                                {t("register")}
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="w-1/2 h-screen relative">
                <div
                    className="absolute inset-0 bg-cover bg-center filter grayscale"
                    style={{ backgroundImage: "url('/image/biologi.jpeg')" }}
                ></div>
                <div className="absolute inset-0 bg-red-200 bg-opacity-80 pointer-events-none"></div>
            </div>
        </div>
    </FormProvider>
  );
}