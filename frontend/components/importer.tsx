"use client";

import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/context/LanguageContext";
import { File } from "lucide-react";
import axios from "axios";
import { useState } from "react";
import { Button } from "./ui/button";

// Validation schema for the form
const FormSchema = z.object({
  xml: typeof window === "undefined" ? z.any() : z.instanceof(FileList),
});

export default function Importer({
  formData,
  onSubmit,
}: {
  formData: any;
  onSubmit: (data: any) => void;
}) {
  const { t } = useLanguage();

  const [downloadLink, setDownloadLink] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);

  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: formData,
  });

  const fileRef = form.register("xml");

  const handleFormSubmit = async (data: any) => {
    const file = data.xml[0];
    console.log("File submitted:", file);

    if (!file) {
      console.error("No file selected!");
      return;
    }

    const formData = new FormData();
    formData.append("xml_file", file);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/upload-xml/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Handle response
      console.log("File converted successfully", response.data);
      setUploadSuccess(true);
      setDownloadLink(response.data.excel_file_path);

      onSubmit(data);
    } catch (error) {
      console.error("Error uploading file", error);
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} id="importer-form">
        <div className="space-y-6 max-w-4xl mx-auto p-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <File className="h-5 w-5" />
                {t("upload_pdf")}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              <FormField
                control={form.control}
                name="xml"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormControl>
                        <Input type="file" {...fileRef} accept=".xml, .pdf" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <Button type="submit" disabled={uploadSuccess} variant="green">
                {uploadSuccess ? t("processing") : t("convert")}
              </Button>

              {uploadSuccess && downloadLink && (
                <a href={downloadLink} download>
                  <Button className="mt-4">Download Excel</Button>
                </a>
              )}
            </CardContent>
          </Card>
        </div>
      </form>
    </FormProvider>
  );
}
