import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const empty_field_error_message = "Input diperlukan.";
const FormSchema = z.object({
	statements: z.array(
		z.object({ value: z.string().min(1, empty_field_error_message) })
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

  const usedLanguages = form.watch("used_languages") || [];

  const fileRefGambar = form.register("gambar");
  const fileRefRumus = form.register("rumus");

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
          console.log("Form submitted!");
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
                <p className="text-sm text-muted-foreground">Statement {statementIndex + 1}</p>
                {usedLanguages.map((lang: { value: string }, langIndex: number) => (
                  <FormField
                    control={form.control}
                    key={`${field.id}-${langIndex}`}
                    name={`statements.${statementIndex}.values.${langIndex}`}
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-2">
                          <FormControl>
                            <Input placeholder={`Bahasa: ${lang.value}`} {...field} />
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
                ))}
              </div>
            ))}
            <Button
              type="button"
              size="sm"
              className="mt-2 w-10 h-10 flex items-center justify-center mx-auto"
              onClick={() => appendStatement({ value: "" })}
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
              <div>
                <FormField
                  control={form.control}
                  name="gambar"
                  render={({ field }) => {
                    return (
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
                    );
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card id="rumus">
          <CardHeader>
            <CardTitle>Rumus (sebagai gambar)</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-4">
              <div>
                <FormField
                  control={form.control}
                  name="rumus"
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="file"
                            accept=".jpg, .jpeg, .png"
                            {...fileRefRumus}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </FormProvider>
  );
}