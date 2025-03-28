import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X } from "lucide-react";
import { useFieldArray, useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState, useRef } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MathJax, MathJaxContext } from "better-react-mathjax";
import { latexSymbols } from "@/utils/latexSymbols";
import { latexOperations } from "@/utils/latexOperations";

const empty_field_error_message = "Input diperlukan.";
const FormSchema = z.object({
  statements: z.array(
    z.object({ 
      values: z.string().min(1, empty_field_error_message),
      has_formula: z.boolean().default(false),
      formula: z.string().optional(),
    })
  ),
  images: z.array(
    z.object({ 
      gambar: typeof window === 'undefined' ? z.any() : z.instanceof(FileList),
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

  useEffect(() => {
    statementFields.forEach((_, index) => {
      if (!form.watch(`statements.${index}.has_formula`)) {
        form.setValue(`statements.${index}.formula`, ""); // Reset formula field
      }
    });
  }, [form.watch, form, statementFields]);

  const {
    fields: imageFields,
    append: appendImage,
    remove: removeImage,
  } = useFieldArray({
    control: form.control,
    name: "images",
  });

  const usedLanguages = form.watch("used_languages") || [];

  const fileRefGambar = form.register("gambar");

  const [latexInput, setLatexInput] = useState("");
  const latexInputRef = useRef<HTMLInputElement>(null);
  const insertSymbol = (latex: string, statementIndex: number, event?: React.MouseEvent<HTMLButtonElement>) => {
    event?.preventDefault();
    event?.stopPropagation();
  
    const currentFormula = form.getValues(`statements.${statementIndex}.formula`) || "";
    const updatedFormula = currentFormula + latex;
  
    form.setValue(`statements.${statementIndex}.formula`, updatedFormula);
  };  

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
          <CardContent className="grid gap-6">
            <div className="grid gap-4">
              {statementFields.map((field, statementIndex) => (
                <div key={field.id} className="grid gap-1 border-b pb-4 relative">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Statement {statementIndex + 1}</p>
                    {statementFields.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="flex items-center justify-center"
                        onClick={() => removeStatement(statementIndex)}
                      >
                        <X />
                      </Button>
                    )}
                  </div>
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
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                  
                  <div id="checkbox_rumus" className="mt-3">
                    <FormField
                      control={form.control}
                      name={`statements.${statementIndex}.has_formula`}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox 
                              checked={field.value}
                              onCheckedChange={(checked) => field.onChange(checked)}
                            />
                          </FormControl>
                          <FormLabel>Ada rumus di statement ini</FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>

                  {form.watch(`statements.${statementIndex}.has_formula`) && (
                    <MathJaxContext>
                      <div id="rumus" className="mt-2">
                        <FormLabel>Rumus</FormLabel>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-4">
                            <FormField
                              control={form.control}
                              name={`statements.${statementIndex}.formula`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      ref={latexInputRef}  // Attach ref here
                                      value={form.watch(`statements.${statementIndex}.formula`)}
                                      onChange={(e) => form.setValue(`statements.${statementIndex}.formula`, e.target.value)}
                                      placeholder="LaTeX"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <Card>
                              <CardContent>
                                <MathJax>{`$$${form.watch(`statements.${statementIndex}.formula`) || ""}$$`}</MathJax>
                              </CardContent>
                            </Card>
                          </div>
                          <ScrollArea className="h-40 w-full border rounded-md p-2">
                            <div className="p-2">
                              <div className="grid grid-cols-2 gap-2">
                                {latexSymbols.map((group) => (
                                  <div key={group.category}>
                                    <Select onValueChange={(value) => insertSymbol(value, statementIndex)}>
                                      <SelectTrigger>
                                        <span>{group.category}</span>
                                      </SelectTrigger>
                                      <SelectContent>
                                        {group.symbols.map(({ latex, description }) => (
                                          <SelectItem key={latex} value={latex}>
                                            <span className="inline-flex items-center">
                                              <MathJax>{`\\(${latex}\\)`}</MathJax>
                                              <span className="ml-1">{description}</span>
                                            </span>
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="p-2">
                              <div className="grid grid-cols-8 gap-1">
                                {latexOperations
                                  .find((group) => group.category === "small")
                                  ?.symbols.map(({ latex }) => (
                                  <Button
                                    variant="secondary"
                                    key={latex}
                                    onClick={(e) => insertSymbol(latex, statementIndex, e)}
                                  >
                                    <span className="text-lg">
                                      <MathJax>{`\\(${latex}\\)`}</MathJax>
                                    </span>
                                  </Button>
                                ))}
                              </div>
                              <div className="grid grid-cols-5 gap-1 mt-1">
                                {latexOperations
                                  .find((group) => group.category === "long")
                                  ?.symbols.map(({ latex }) => (
                                    <Button
                                      variant="secondary"
                                      key={latex}
                                      value={latex}
                                      onClick={(e) => insertSymbol(latex, statementIndex, e)}
                                    >
                                      <span>
                                        <MathJax>{`\\(${latex}\\)`}</MathJax>
                                      </span>
                                    </Button>
                                  ))}
                              </div>
                              <div className="grid grid-cols-5 gap-1 mt-1">
                                {latexOperations
                                  .find((group) => group.category === "big")
                                  ?.symbols.map(({ latex }) => (
                                    <Button
                                      variant="secondary"
                                      key={latex}
                                      value={latex}
                                      onClick={(e) => insertSymbol(latex, statementIndex, e)}
                                      className="h-15"
                                    >
                                      <span>
                                        <MathJax>{`\\(${latex}\\)`}</MathJax>
                                      </span>
                                    </Button>
                                  ))}
                              </div>
                            </div>
                          </ScrollArea>
                        </div>
                      </div>
                    </MathJaxContext>
                  )}
                </div>
              ))}
              <Button
                type="button"
                size="sm"
                className="mt-2 w-10 h-10 flex items-center justify-center mx-auto"
                onClick={() => appendStatement({ value: "" })}
              >
                <p className="text-xl"><Plus /></p>
              </Button>
            </div>
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
                    <X />
                  </Button>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div id="upload">
                    <FormLabel>Upload File Gambar</FormLabel>
                    <FormField
                      control={form.control}
                      name={`images.${index}.gambar`}
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
              onClick={() =>
                appendImage({ gambar: "", caption: "" })
              }
            >
              <p className="text-xl"><Plus /></p>
            </Button>
          </CardContent>
        </Card>
      </form>
    </FormProvider>
  );
}
