import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const empty_field_error_message = "Input diperlukan.";

const FormSchema = z.object({
  statements: z.array(
    z.object({ values: z.array(
      z.string().min(1, empty_field_error_message) 
    )})
  ),
  images: z.array(
    z.object({
      gambar: typeof window === "undefined" ? z.any() : z.instanceof(FileList),
      caption: z.string().min(1, { message: empty_field_error_message }),
    })
  ),
});

export default function Statements({
  formData,
  updateFormData,
}: {
  formData: any;
  updateFormData: (data: any) => void;
}) {
  const form = useForm({
    resolver: zodResolver(FormSchema),
    mode: "onChange",
    defaultValues: formData,
  });

  useEffect(() => {
    const subscription = form.watch((values) => {
      updateFormData(values);
    });

    return () => subscription.unsubscribe();
  }, [form.watch]);

  const {
    fields: statementFields,
    append: appendStatement,
    remove: removeStatement,
  } = useFieldArray({
    control: form.control,
    name: "statements",
  });

  const {
    fields: imageFields,
    append: appendImage,
    remove: removeImage,
  } = useFieldArray({
    control: form.control,
    name: "images",
  });

  const fileRefGambar = form.register("gambar");

  const onSubmit = async (data: any) => {
    try {
      const response = await fetch("http://127.0.0.1:8000/create-dcc/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorResult = await response.json();
        console.error("Error response from server:", errorResult);
        alert(`Failed to create DCC: ${errorResult.detail}`);
        return;
      }

      const result = await response.json();
      console.log("DCC Created:", result);
      alert(`DCC Created! Download: ${result.download_link}`);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred while submitting the form.");
    }
  };

  return (
    <FormProvider {...form}>
      <form
        onSubmit={(e) => {
          form.handleSubmit(onSubmit)(e);
        }}
        className="space-y-6 max-w-4xl mx-auto p-4"
      >
        <Card id="statement">
          <CardHeader>
            <CardTitle>Statements/Pernyataan</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-1">
            {statementFields.map((field, statementIndex) => (
              <div key={field.id} className="grid gap-1 border-b pb-4 relative">
                <p className="text-sm text-muted-foreground">
                  Statement {statementIndex + 1}
                </p>
                {formData.used_languages.map(
                  (lang: { value: string }, langIndex: number) => (
                    <FormField
                      control={form.control}
                      key={`${field.id}-${langIndex}`}
                      name={`statements.${statementIndex}.values.${langIndex}`}
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-2">
                            <FormControl>
                              <Input
                                placeholder={`Bahasa: ${lang.value}`}
                                {...field}
                              />
                            </FormControl>
                            {statementFields.length > 1 && (
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                onClick={() => removeStatement(statementIndex)}
                              >
                                ✕
                              </Button>
                            )}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )
                )}
              </div>
            ))}
            <Button
              type="button"
              size="sm"
              className="mt-2 w-10 h-10 flex items-center justify-center mx-auto"
              onClick={() => appendStatement({ values: "" })}
            >
              <p className="text-xl">+</p>
            </Button>
          </CardContent>
        </Card>

        <Card id="gambar">
          <CardHeader>
            <CardTitle>Gambar</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-4">
              {imageFields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid gap-4 border-b pb-4 relative"
                >
                  <p className="text-sm text-muted-foreground">
                    Gambar {index + 1}
                  </p>
                  {imageFields.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-0 right-0"
                      onClick={() => removeImage(index)}
                    >
                      ✕
                    </Button>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div id="upload">
                      <FormLabel>Upload File Gambar</FormLabel>
                      <FormField
                        control={form.control}
                        name={`images.${index}.gambar`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="file"
                                accept=".jpg, .jpeg, .png"
                                {...fileRefGambar}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div id="caption">
                      <FormLabel>Caption Gambar</FormLabel>
                      <FormField
                        control={form.control}
                        name={`images.${index}.caption`}
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
                  </div>
                </div>
              ))}
            </div>
            <Button
              type="button"
              size="sm"
              className="mt-4 w-10 h-10 flex items-center justify-center mx-auto"
              onClick={() => appendImage({ gambar: null, caption: "" })}
            >
              <p className="text-xl">+</p>
            </Button>
          </CardContent>
        </Card>
      </form>
    </FormProvider>
  );
}
