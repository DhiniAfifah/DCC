import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X } from "lucide-react";
import { useFieldArray, useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from "@/context/LanguageContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MathJax, MathJaxContext } from "better-react-mathjax";
import { latexSymbols } from "@/utils/latexSymbols";
import { latexOperations } from "@/utils/latexOperations";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const empty_field_error_message = "Input required.";
const FormSchema = z.object({
  statements: z.array(
    z.object({
      values: z.string().min(1, empty_field_error_message),
      has_formula: z.boolean().default(false),
      formula: z
        .object({
          latex: z.string().optional(),
          mathml: z.string().optional(),
        })
        .optional(),
      has_image: z.boolean().default(false),
      image: z
        .object({
          gambar: z.any().optional(),
          caption: z.string().optional(),
        })
        .optional(),
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

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (!name?.startsWith("statements.")) return;

      const match = name.match(/^statements\.(\d+)\.has_formula$/);
      if (match) {
        const index = Number(match[1]);
        const hasFormula = value?.methods?.[index]?.has_formula;
        if (!hasFormula) {
          form.setValue(`statements.${index}.formula`, "");
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  const [latexInput, setLatexInput] = useState("");
  const latexInputRef = useRef<HTMLInputElement>(null);
  const insertSymbol = (
    latex: string,
    statementIndex: number,
    event?: React.MouseEvent<HTMLButtonElement>
  ) => {
    event?.preventDefault();
    event?.stopPropagation();

    const currentFormula =
      form.getValues(`statements.${statementIndex}.formula.mathjax`) || "";
    const updatedFormula = currentFormula + latex;

    form.setValue(
      `statements.${statementIndex}.formula.mathjax`,
      updatedFormula
    );
  };

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (!name?.startsWith("statements.")) return;

      const match = name.match(/^statements\.(\d+)\.has_image$/);
      if (match) {
        const index = Number(match[1]);
        const hasImage = value?.methods?.[index]?.has_image;
        if (!hasImage) {
          form.setValue(`statements.${index}.image`, "");
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  const {
    fields: statementFields,
    append: appendStatement,
    remove: removeStatement,
  } = useFieldArray({
    control: form.control,
    name: "statements",
  });

  const usedLanguages = form.watch("administrative_data.used_languages") || [];

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

  const { t } = useLanguage();

  return (
    <FormProvider {...form}>
      <form
        onSubmit={(e) => {
          console.log("Form submitted!");
          form.handleSubmit(onSubmit)(e);
        }}
        className="space-y-16 max-w-4xl mx-auto p-4"
      >
        <Card id="statement">
          <CardHeader>
            <CardTitle>{t("statements")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-4">
              {statementFields.map((field, statementIndex) => (
                <div
                  key={field.id}
                  className="grid gap-1 border-b pb-4 relative"
                >
                  <div className="flex items-center justify-between">
                    <CardDescription>
                      {t("statement")} {statementIndex + 1}
                    </CardDescription>
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
                  {usedLanguages.map(
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
                                  placeholder={`${t("bahasa")} ${lang.value}`}
                                  {...field}
                                />
                              </FormControl>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )
                  )}

                  <div id="checkbox_rumus" className="mt-3">
                    <FormField
                      control={form.control}
                      name={`statements.${statementIndex}.has_formula`}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(checked) =>
                                field.onChange(checked)
                              }
                            />
                          </FormControl>
                          <FormLabel>{t("cb_rumus_statement")}</FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>

                  {form.watch(`statements.${statementIndex}.has_formula`) && (
                    <div id="rumus" className="mt-2">
                      <FormLabel>{t("rumus")}</FormLabel>
                      <div className="grid grid-cols-2 gap-1">
                        <FormField
                          control={form.control}
                          name={`statements.${statementIndex}.formula.latex`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input placeholder="LaTeX" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`statements.${statementIndex}.formula.mathml`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input placeholder="MathML" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="blue"
                        className="mt-1"
                        onClick={() => {
                          const latex = form.getValues(
                            `statements.${statementIndex}.formula.latex`
                          );
                          const encodedLatex = encodeURIComponent(latex || "");

                          const popup = window.open(
                            `/imatheq.html?latex=${encodedLatex}`, // pre-fill using URL parameter
                            "mathEditorPopup",
                            "width=800,height=600"
                          );

                          // Define the callback function to receive LaTeX from the popup
                          window.ShowLatexResult = (latex, mathml) => {
                            form.setValue(
                              `statements.${statementIndex}.formula.latex`,
                              latex
                            );
                            form.setValue(
                              `statements.${statementIndex}.formula.mathml`,
                              mathml
                            );
                          };
                        }}
                      >
                        {t("editor")}
                      </Button>
                    </div>
                  )}
                  <MathJaxContext>
                    <div id="rumus" className="mt-2">
                      <FormLabel>Rumus</FormLabel>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-4">
                          <FormField
                            control={form.control}
                            name={`statements.${statementIndex}.formula.mathjax`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    ref={latexInputRef}
                                    value={form.watch(
                                      `statements.${statementIndex}.formula.mathjax`
                                    )}
                                    onChange={(e) =>
                                      form.setValue(
                                        `statements.${statementIndex}.formula.mathjax`,
                                        e.target.value
                                      )
                                    }
                                    placeholder="LaTeX"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Card className="border shadow">
                            <CardContent>
                              <MathJax>{`$$${
                                form.watch(
                                  `statements.${statementIndex}.formula.mathjax`
                                ) || ""
                              }$$`}</MathJax>
                            </CardContent>
                          </Card>
                        </div>
                        <ScrollArea className="h-40 w-full border rounded-md p-2">
                          <div className="p-2">
                            <div className="grid grid-cols-2 gap-2">
                              {latexSymbols.map((group) => (
                                <div key={group.category}>
                                  <Select
                                    onValueChange={(value) =>
                                      insertSymbol(value, statementIndex)
                                    }
                                  >
                                    <SelectTrigger>
                                      <span>{group.category}</span>
                                    </SelectTrigger>
                                    <SelectContent>
                                      {group.symbols.map(
                                        ({ latex, description }) => (
                                          <SelectItem key={latex} value={latex}>
                                            <span className="inline-flex items-center">
                                              <MathJax>{`\\(${latex}\\)`}</MathJax>
                                              <span className="ml-1">
                                                {description}
                                              </span>
                                            </span>
                                          </SelectItem>
                                        )
                                      )}
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
                                    onClick={(e) =>
                                      insertSymbol(latex, statementIndex, e)
                                    }
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
                                    onClick={(e) =>
                                      insertSymbol(latex, statementIndex, e)
                                    }
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
                                    onClick={(e) =>
                                      insertSymbol(latex, statementIndex, e)
                                    }
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

                  <div id="checkbox_gambar" className="mt-3 mb-1">
                    <FormField
                      control={form.control}
                      name={`statements.${statementIndex}.has_image`}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(checked) =>
                                field.onChange(checked)
                              }
                            />
                          </FormControl>
                          <FormLabel>{t("cb_gambar_metode")}</FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>

                  {form.watch(`statements.${statementIndex}.has_image`) && (
                    <div id="gambar">
                      <div className="grid grid-cols-2 gap-4">
                        <div id="upload">
                          <FormLabel>{t("upload_gambar")}</FormLabel>
                          <FormField
                            control={form.control}
                            name={`statements.${statementIndex}.image.gambar`}
                            render={({ field: { onChange, ref } }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    type="file"
                                    accept=".jpg, .jpeg, .png"
                                    ref={ref}
                                    onChange={(e) => {
                                      onChange(e.target.files?.[0]); // Save first file
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div id="caption">
                          <FormLabel>{t("caption")}</FormLabel>
                          <FormField
                            control={form.control}
                            name={`statements.${statementIndex}.image.caption`}
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
                  )}
                </div>
              ))}
              <Button
                variant="green"
                type="button"
                size="sm"
                className="mt-2 w-10 h-10 flex items-center justify-center mx-auto"
                onClick={() =>
                  appendStatement({
                    values: "",
                    has_formula: false,
                    formula: {
                      latex: "",
                      mathml: "",
                    },
                    has_image: false,
                    image: {
                      gambar: "",
                      caption: "",
                    },
                  })
                }
              >
                <p className="text-xl">
                  <Plus />
                </p>
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </FormProvider>
  );
}
