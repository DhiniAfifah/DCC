import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X, ScrollText } from "lucide-react";
import { useFieldArray, useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
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
import { latexSymbols, latexOperations } from "@/utils/latexNotations";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Language, fetchLanguages } from "@/utils/language";

const empty_field_error_message = "Input required/dibutuhkan.";
const FormSchema = z.object({
  statements: z.array(
    z.object({
      values: z.record(z.string()).optional(),
      refType: z.string().min(1, { message: empty_field_error_message }),
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
          fileName: z.any().optional(),
          caption: z.string().optional(),
          mimeType: z.string().optional(),
          base64: z.string().optional(),
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
    mode: "onBlur", // Ubah dari "onChange" ke "onBlur" untuk stabilitas
    defaultValues: formData,
  });

  // Stabilkan updateFormData dengan useCallback
  const updateFormDataCallback = useCallback((data: any) => {
    updateFormData(data);
  }, [updateFormData]);

  // Perbaiki form.reset() - hanya reset jika benar-benar berbeda
  useEffect(() => {
    const currentValues = form.getValues();
    if (JSON.stringify(currentValues) !== JSON.stringify(formData)) {
      const timer = setTimeout(() => {
        form.reset(formData);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [formData, form]);

  // Perbaiki form watching - gunakan debounce yang lebih stabil
  useEffect(() => {
    const subscription = form.watch((values) => {
      if (!form.formState.isLoading) {
        const timeoutId = setTimeout(() => {
          updateFormDataCallback(values);
        }, 300); // Debounce lebih lama untuk stabilitas

        return () => clearTimeout(timeoutId);
      }
    });

    return () => subscription.unsubscribe();
  }, [form, updateFormDataCallback]);

  // Perbaiki formula watching
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (!name?.startsWith("statements.")) return;

      const match = name.match(/^statements\.(\d+)\.has_formula$/);
      if (match) {
        const index = Number(match[1]);
        const hasFormula = value?.statements?.[index]?.has_formula;
        if (!hasFormula) {
          form.setValue(`statements.${index}.formula`, "");
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  // Perbaiki image watching
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (!name?.startsWith("statements.")) return;

      const match = name.match(/^statements\.(\d+)\.has_image$/);
      if (match) {
        const index = Number(match[1]);
        const hasImage = value?.statements?.[index]?.has_image;
        if (!hasImage) {
          form.setValue(`statements.${index}.image`, "");
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  const [latexInput, setLatexInput] = useState("");
  const latexInputRef = useRef<HTMLInputElement>(null);
  
  // Memoize insertSymbol function
  const insertSymbol = useCallback((
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
  }, [form]);

  const {
    fields: statementFields,
    append: appendStatement,
    remove: removeStatement,
  } = useFieldArray({
    control: form.control,
    name: "statements",
  });

  // Perbaiki usedLanguages - gunakan formData langsung, bukan form.watch
  const usedLanguages: { value: string }[] = 
    formData?.administrative_data?.used_languages || [];

  // Memoize createMultilangObject
  const createMultilangObject = useCallback(
    (usedLanguages: { value: string }[]): Record<string, string> => {
      const result: Record<string, string> = {};
      usedLanguages.forEach((lang) => {
        if (lang.value?.trim()) {
          result[lang.value] = "";
        }
      });
      return result;
    },
    []
  );

  const [languages, setLanguages] = useState<Language[]>([]);
  useEffect(() => {
    fetchLanguages().then(setLanguages);
  }, []);

  // Memoize handlers
  const handleRemoveStatement = useCallback((index: number) => {
    removeStatement(index);
  }, [removeStatement]);

  const handleAppendStatement = useCallback(() => {
    const currentLanguages = usedLanguages.filter(lang => lang.value && lang.value.trim());
    
    appendStatement({
      values: createMultilangObject(currentLanguages),
      refType: "",
      has_formula: false,
      formula: {
        latex: "",
        mathml: "",
      },
      has_image: false,
      image: {
        fileName: "",
        caption: "",
        base64: "",
        mimeType: "",
      },
    });
  }, [appendStatement, createMultilangObject, usedLanguages]);

  // Memoize validLanguages untuk mencegah re-render berlebihan
  const validLanguages = useMemo(() => {
    return usedLanguages.filter((lang) => lang.value && lang.value.trim());
  }, [usedLanguages]);

  // Memoize handleFileUpload
  const handleFileUpload = useCallback(async (
    event: React.ChangeEvent<HTMLInputElement>,
    isImageUpload: boolean,
    statementIndex?: number
  ) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];

      // Validasi tipe file
      if (
        isImageUpload &&
        !["image/jpeg", "image/png", "image/jpg"].includes(file.type)
      ) {
        alert("Please upload a valid image (JPEG/PNG/JPG).");
        return;
      }

      // Validasi ukuran file (5MB)
      if (file.size > 5_000_000) {
        alert("File size should be less than 5MB.");
        return;
      }

      try {
        // Upload file ke backend menggunakan FormData
        const formData = new FormData();
        formData.append("image", file);

        const response = await fetch("http://127.0.0.1:8000/upload-image/", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error("Failed to upload image");

        const result = await response.json();

        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          const base64WithoutPrefix = base64String.split(",")[1];

          if (statementIndex !== undefined) {
            form.setValue(
              `statements.${statementIndex}.image.fileName`,
              result.filename
            );
            form.setValue(
              `statements.${statementIndex}.image.mimeType`,
              result.mimeType
            );
            form.setValue(
              `statements.${statementIndex}.image.base64`,
              base64WithoutPrefix
            );
          }

          alert("Image uploaded successfully.");
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error("Error uploading image:", error);
        alert("Image upload failed.");
      }
    }
  }, [form]);

  const onSubmit = async (data: any) => {
    try {
      const formData = new FormData();

      // Append each file in statements to FormData
      data.statements.forEach((statement: any, index: number) => {
        if (statement.image?.fileName) {
          formData.append(
            `statements[${index}].image.fileName`,
            statement.image.fileName
          );
        }
      });

      // Tambahkan seluruh data statements yang lainnya sebagai JSON
      formData.append("statements", JSON.stringify(data.statements));

      // Kirim data ke API backend
      const response = await fetch("http://127.0.0.1:8000/create-dcc/", {
        method: "POST",
        body: formData,
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
            <CardTitle className="flex items-center gap-2">
              <ScrollText className="w-5 h-5" />
              {t("statements")}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {statementFields.map((field, statementIndex) => (
              <div key={field.id} className="grid gap-1 border-b pb-4 relative">
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
                      onClick={() => handleRemoveStatement(statementIndex)}
                    >
                      <X />
                    </Button>
                  )}
                </div>
                {validLanguages.length === 0 ? (
                  <p className="text-sm text-red-600">{t("pilih_bahasa")}</p>
                ) : (
                  validLanguages.map((lang: { value: string }) => (
                    <FormField
                      control={form.control}
                      key={`statements-${statementIndex}-${lang.value}`} // Key yang lebih stabil
                      name={`statements.${statementIndex}.values.${lang.value}`}
                      render={({ field: statementField }) => (
                        <FormItem>
                          <div className="flex items-center gap-2">
                            <FormControl>
                              <Textarea
                                placeholder={`${t("bahasa")} ${
                                  languages.find(l => l.value === lang.value)?.label || lang.value
                                }`}
                                {...statementField}
                                value={statementField.value || ""}
                                onChange={(e) => {
                                  // Pastikan onChange tidak memicu re-render yang tidak perlu
                                  statementField.onChange(e.target.value);
                                }}
                              />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))
                )}

                <div id="refType" className="my-3">
                  <FormLabel variant="mandatory">{t("refType")}</FormLabel>
                  <FormField
                    control={form.control}
                    name={`statements.${statementIndex}.refType`}
                    render={({ field }) => (
                      <FormItem>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="whitespace-normal">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem
                              value="basic_conformity"
                              className="whitespace-normal break-words max-w-xs md:max-w-2xl lg:max-w-3xl"
                            >
                              {t("basic_conformity")}
                            </SelectItem>
                            <SelectItem
                              value="basic_metrologicallyTraceableToSI"
                              className="whitespace-normal break-words max-w-xs md:max-w-2xl lg:max-w-3xl"
                            >
                              {t("basic_metrologicallyTraceableToSI")}
                            </SelectItem>
                            <SelectItem
                              value="basic_revision"
                              className="whitespace-normal break-words max-w-xs md:max-w-2xl lg:max-w-3xl"
                            >
                              {t("basic_revision")}
                            </SelectItem>
                            <SelectItem
                              value="basic_isInCMC"
                              className="whitespace-normal break-words max-w-xs md:max-w-2xl lg:max-w-3xl"
                            >
                              {t("basic_isInCMC")}
                            </SelectItem>
                            <SelectItem
                              value="other" // ga ada refType
                              className="whitespace-normal break-words max-w-xs md:max-w-2xl lg:max-w-3xl"
                            >
                              {t("other")}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

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
                    <div className="grid grid-row md:grid-cols-2 gap-1">
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
                {/* <MathJaxContext>
                  <div id="rumus" className="mt-2">
                    <FormLabel>Rumus</FormLabel>
                    <div className="grid grid-row md:grid-cols-2 gap-4">
                      <div className="grid gap-4">
                        <FormField
                          control={form.control}
                          name={`statements.${statementIndex}.formula.mathjax`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  ref={latexInputRef}
                                  value={
                                    form.watch(
                                      `statements.${statementIndex}.formula.mathjax`
                                    ) ?? ""
                                  }
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
                          <div className="grid grid-row md:grid-cols-2 gap-2">
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
                </MathJaxContext> */}

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
                    <div className="grid grid-row md:grid-cols-2 gap-4">
                      <div id="upload">
                        <FormLabel>{t("upload_gambar")}</FormLabel>
                        <FormField
                          control={form.control}
                          name={`statements.${statementIndex}.image.fileName`}
                          render={({ field: { onChange, ref } }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="file"
                                  accept=".jpg, .jpeg, .png"
                                  ref={ref}
                                  onChange={(e) => {
                                    handleFileUpload(e, true, statementIndex);
                                    onChange(
                                      e.target.files ? e.target.files[0] : null
                                    );
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
              onClick={handleAppendStatement}
            >
              <p className="text-xl">
                <Plus />
              </p>
            </Button>
          </CardContent>
        </Card>
      </form>
    </FormProvider>
  );
}
