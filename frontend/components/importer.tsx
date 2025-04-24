import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
    Card, 
    CardHeader, 
    CardTitle, 
    CardContent 
} from "@/components/ui/card";
import {
    FormControl,
    FormField,
    FormItem,
    FormMessage,
  } from "@/components/ui/form";
  import { Input } from "@/components/ui/input";

const FormSchema = z.object({
    xml: typeof window === 'undefined' ? z.any() : z.instanceof(FileList)
})

export default function Importer({
    formData
}: {
    formData: any;
}) {
    const form = useForm({
        resolver: zodResolver(FormSchema),
        defaultValues: formData,
    });

    const fileRef = form.register("xml");
    
    return (
        <FormProvider {...form}>
            <form>
                <div className="space-y-6 max-w-4xl mx-auto p-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Upload PDF</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            <FormField
                                control={form.control}
                                name="xml"
                                render={({ field }) => {
                                    return (
                                        <FormItem>
                                            <FormControl>
                                                <Input type="file" {...fileRef} accept=".pdf, .xml" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    );
                                }}
                            />
                        </CardContent>
                    </Card>
                </div>
            </form>
        </FormProvider>
    );
}