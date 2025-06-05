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
        `username=${data.email}&password=${data.password}`,
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );
      localStorage.setItem("access_token", response.data.access_token);
      window.location.href = "/main";
    } catch (error) {
      setErrorMessage("Login failed, please check your credentials.");
    }
  };

  return (
    <FormProvider {...form}>
      <div className="fixed inset-0 -z-20 bg-gradient-to-b from-white to-red-200"></div>

      <div className="flex items-center justify-center min-h-screen mt-0 md:mt-20">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle className="text-center">{t("login")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}{" "}
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/">
              <Button variant="green" onClick={form.handleSubmit(onSubmit)}>
                {t("login")}
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </FormProvider>
  );
}
