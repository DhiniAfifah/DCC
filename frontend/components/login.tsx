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

export const FormSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string(),
})

export default function Login({formData}: {formData: any}) {
    const form = useForm({
        resolver: zodResolver(FormSchema),
        mode: "onChange",
        defaultValues: formData,
    });
    
    return (
        <FormProvider {...form}>
            <form>
                <div className="fixed inset-0 -z-20 bg-gradient-to-br from-gray-50 to-blue-200"></div>
                
                <div className="flex items-center justify-center min-h-screen">
                    <Card className="w-[350px]">
                        <CardHeader>
                            <CardTitle className="text-center">Login</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div id="email">
                                <FormLabel>E-mail</FormLabel>
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
                                <FormLabel>Password</FormLabel>
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
                            <Button type="submit" variant="green">Login</Button>
                        </CardFooter>
                    </Card>
                </div>
            </form>
        </FormProvider>
    );
}