import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X, NotepadText } from "lucide-react";
import { useFieldArray, useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from "@/context/LanguageContext";
import { Language, fetchLanguages } from "@/utils/language";
import { Textarea } from "@/components/ui/textarea";

export default function Comment({
  formData,
  updateFormData,
  onValidationChange,
}: {
  formData: any;
  updateFormData: (data: any) => void;
  onValidationChange?: (isValid: boolean) => void;
}) {
  const { t } = useLanguage();

  const FormSchema = useMemo(
    () =>
      z.object({
        comment: z.object({
          title: z.string().min(1, { message: t("input_required") }),
          desc: z.record(z.string()).refine(obj => Object.keys(obj).length > 0, {
            message: t("input_required"),
          }),
          has_file: z.boolean(),
          files: z
            .array(
              z.object({
                file: z.any(),
                fileName: z.string().min(1, { message: t("input_required") }),
                mimeType: z.string().min(1, { message: t("input_required") }),
                base64: z.string().min(1, { message: t("input_required") }),
              })
            )
            .optional(),
        }),
      }),
    [t]
  );

  // Add validation check effect
  useEffect(() => {
    const validateForm = () => {
      const result = FormSchema.safeParse(formData);
      onValidationChange?.(result.success);
    };

    validateForm();
  }, [formData, onValidationChange]);

  const form = useForm({
    resolver: zodResolver(FormSchema),
    mode: "onBlur",
    defaultValues: formData,
  });

  const [isResetting, setIsResetting] = useState(false);

  const updateFormDataCallback = useCallback((data: any) => {
    updateFormData(data);
  }, [updateFormData]);

  useEffect(() => {
    const currentValues = form.getValues();
    if (JSON.stringify(currentValues) !== JSON.stringify(formData)) {
      const timer = setTimeout(() => {
        form.reset(formData);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [formData, form]);

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

  const {
    fields: fileFields,
    append: appendFile,
    remove: removeFile,
  } = useFieldArray({
    control: form.control,
    name: "comment.files",
  });

  const usedLanguages: { value: string }[] =
    form.watch("administrative_data.used_languages") || [];

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

  const validLanguages = usedLanguages.filter(
    (lang) => lang.value && lang.value.trim()
  );

  useEffect(() => {
    const currentFiles = form.getValues("comment.files");
    if (!currentFiles || currentFiles.length === 0) {
      appendFile({ file: "" });
    }
  }, []);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    isFileUpload: boolean,
    commentindex?: number
  ) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];

      // Upload file ke backend
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      try {
        const response = await fetch("http://127.0.0.1:8000/upload-file/", {
          method: "POST",
          body: uploadFormData,
        });

        if (!response.ok) throw new Error("Failed to upload file");

        const result = await response.json();

        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;

          const base64WithoutPrefix = base64String.split(",")[1];

          if (commentindex !== undefined) {
            form.setValue(
              `comment.files.${commentindex}.fileName`,
              result.filename
            );
            form.setValue(
              `comment.files.${commentindex}.mimeType`,
              result.mimeType
            );
            form.setValue(
              `comment.files.${commentindex}.base64`,
              base64WithoutPrefix
            );
          }

          alert("File uploaded successfully.");
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error("Error uploading file:", error);
        alert("File upload failed.");
      }
    }
  };

  const onSubmit = async (data: any) => {
    try {
      const preparedComment = {
        ...data.comment,
        files:
          data.comment.files?.map((fileObj: any) => ({
            fileName: fileObj.fileName || "",
            mimeType: fileObj.mimeType || "",
            base64: fileObj.base64 || "",
          })) || [],
      };

      const submitData = {
        ...data,
        comment: preparedComment,
      };

      const response = await fetch("http://127.0.0.1:8000/create-dcc/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
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
        className="space-y-16 max-w-4xl mx-auto p-4"
      >
        <Card id="comment">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <NotepadText className="w-5 h-5" />
              {t("comment")}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-row md:grid-cols-2 gap-4">
              <div id="title">
                <FormLabel>{t("title")}</FormLabel>
                <FormField
                  control={form.control}
                  name="comment.title"
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
              <div id="description">
                <FormLabel>{t("deskripsi")}</FormLabel>
                {validLanguages.length === 0 ? (
                  <p className="text-sm text-red-600">{t("pilih_bahasa")}</p>
                ) : (
                  validLanguages.map(
                    (lang: { value: string }, langIndex: number) => (
                      <div
                        key={`comment-wrapper-${langIndex}`}
                        className="mb-1"
                      >
                        <FormField
                          control={form.control}
                          key={`comment-${langIndex}`}
                          name={`comment.desc.${lang.value}`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea
                                  placeholder={`${t("bahasa")} ${
                                    languages.find(
                                      (l) => l.value === lang.value
                                    )?.label || lang.value
                                  }`}
                                  {...field}
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )
                  )
                )}
              </div>
            </div>
            <div id="checkbox_file">
              <FormField
                control={form.control}
                name="comment.has_file"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => field.onChange(checked)}
                      />
                    </FormControl>
                    <FormLabel>{t("cb_file")}</FormLabel>
                  </FormItem>
                )}
              />
            </div>
            {form.watch("comment.has_file") && (
              <div id="file">
                <FormLabel>{t("upload_file")}</FormLabel>
                <div className="mt-2 space-y-2">
                  {fileFields.map((field, index) => (
                    <FormField
                      key={field.id}
                      control={form.control}
                      name={`comment.files.${index}.file`}
                      render={({ field: { onChange, ref } }) => (
                        <FormItem>
                          <div className="flex items-center gap-2">
                            <FormControl>
                              <Input
                                type="file"
                                ref={ref}
                                onChange={(e) =>
                                  handleFileUpload(e, true, index)
                                }
                              />
                            </FormControl>
                            {fileFields.length > 1 && (
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                onClick={() => removeFile(index)}
                              >
                                <X />
                              </Button>
                            )}
                          </div>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2 w-10 h-10"
                  onClick={() =>
                    appendFile({
                      file: "",
                      fileName: "",
                      mimeType: "",
                      base64: "",
                    })
                  }
                >
                  <p className="text-xl">
                    <Plus />
                  </p>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </form>
    </FormProvider>
  );
}
