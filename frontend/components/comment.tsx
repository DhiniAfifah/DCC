import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Plus, 
  X,
  NotepadText
} from "lucide-react";
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const empty_field_error_message = "Input required.";
const FormSchema = z.object({
  comment: z.object({
    title: z.string().optional(),
    desc: z.string().optional(),
    has_file: z.boolean().default(false),
    files: z.array(
      z.object({
        file: z.any().optional(),
      })
    ).optional(),
  }),
});

export default function Comment({
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
    fields: fileFields,
    append: appendFile,
    remove: removeFile,
  } = useFieldArray({
    control: form.control,
    name: "comment.files",
  });

  useEffect(() => {
    const currentFiles = form.getValues("comment.files");
    if (!currentFiles || currentFiles.length === 0) {
      appendFile({ file: "" });
    }
  }, []);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    isFileUpload: boolean,
    index?: number
  ) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];

      // Set the file in the form state (for the specific comment and file field)
      if (index !== undefined) {
        form.setValue(`comment.files[${index}].file`, file);
      }
    }
  };

  const onSubmit = async (data: any) => {
    try {
      const formData = new FormData();

      // Append each file in comment to FormData
      data.comment.forEach((comment: any, index: number) => {
        if (comment.files?.file) {
          formData.append(
            `comment[${index}].files.file`,
            comment.files.file
          );
        }
      });

      // Tambahkan seluruh data comment yang lainnya sebagai JSON
      formData.append("comment", JSON.stringify(data.comment));

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
        <Card id="comment">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <NotepadText className="w-5 h-5" />
              {t("comment")}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div id="title">
                <FormLabel>{t("title")}</FormLabel>
                <FormField
                  control={form.control}
                  name={`comment.title`}
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
                <FormField
                  control={form.control}
                  name={`comment.desc`}
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
            <div id="checkbox_file">
              <FormField
                control={form.control}
                name={`comment.has_file`}
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
                    <FormLabel>{t("cb_file")}</FormLabel>
                  </FormItem>
                )}
              />
            </div>
            {form.watch(`comment.has_file`) && (
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
                  onClick={() => appendFile({ file: "" })}
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