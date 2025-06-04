"use client";

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

export const FormSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string(),
})

export default function Login({formData}: {formData: any}) {
    const { t } = useLanguage();

    const form = useForm({
        resolver: zodResolver(FormSchema),
        mode: "onChange",
        defaultValues: formData,
    });
    
    return (
        <FormProvider {...form}>
            {/* <form> */} 
            <div>
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
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-center">
                            <Link href="/main">
                                <Button variant="green">{t("submit")}</Button>
                            </Link>
                        </CardFooter>
                    </Card>
                </div>
            {/* </form> */}
            </div>
        </FormProvider>
    );
}