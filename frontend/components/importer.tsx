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
import { Button } from "@/components/ui/button";

const FormSchema = z.object({
  pdf: typeof window === "undefined" ? z.any() : z.instanceof(FileList),
});

export default function Importer({
  formData,
  onSubmit,
}: {
  formData: any;
  onSubmit: (data: any) => void;
}) {
  const { t } = useLanguage();
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressMessage, setProgressMessage] = useState<string>("");
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFileName, setDownloadFileName] = useState<string>("hasil-konversi.xlsx");

  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: formData,
  });

  const fileRef = form.register("pdf");

  const handleFormSubmit = async (data: any) => {
    const file = data.pdf[0];
    if (!file) {
      console.error("No file selected!");
      return;
    }

    setIsProcessing(true);
    setProgressMessage(t("extract"));
    setProgressPercent(10);
    setDownloadUrl(null); // Reset previous download

    const formData = new FormData();
    formData.append("pdf_file", file);

    try {
      setProgressMessage(t("converting"));
      setProgressPercent(25);

      const response = await axios.post(
        "http://127.0.0.1:8000/upload-pdf/",
        formData,
        {
          responseType: "blob",
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1)
            );
            setProgressMessage(`${t("uploading")}: ${percentCompleted}% ${t("completed")}`);
            setProgressPercent(percentCompleted);
          },
        }
      );

      if (downloadUrl) {
        window.URL.revokeObjectURL(downloadUrl);
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      setDownloadUrl(url);

      const contentDisposition = response.headers["content-disposition"];
      let fileName = "hasil-konversi.xlsx";

      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
        if (fileNameMatch && fileNameMatch[1]) {
          fileName = fileNameMatch[1];
        }
      }
      setDownloadFileName(fileName);

      setProgressMessage(t("convert_success"));
      setProgressPercent(100);

      onSubmit(data);
      setTimeout(() => setIsProcessing(false), 2000);
    } catch (error: any) {
      console.error("Error processing file", error);
      setProgressMessage(
        `Error: ${error.response?.data?.detail || error.message}`
      );
      setProgressPercent(0);
      setIsProcessing(false);
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
                {t("pdf_to_excel")}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              <FormField
                control={form.control}
                name="pdf"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="file"
                          {...fileRef}
                          accept=".pdf"
                          disabled={isProcessing}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <Button
                type="submit"
                disabled={isProcessing}
                variant="green"
              >
                {isProcessing ? t("processing") : t("submit_convert")}
              </Button>

              {isProcessing && (
                <div className="mt-4 p-3 bg-sky-50 rounded-md">
                  <p className="text-sky-700">{progressMessage}</p>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-sky-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {downloadUrl && (
                <div className="">
                  <a
                    href={downloadUrl}
                    download={downloadFileName}
                    className="inline-block bg-sky-500 text-white px-4 py-2 rounded hover:bg-sky-600"
                  >
                    {t("download")}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </form>
    </FormProvider>
  );
}