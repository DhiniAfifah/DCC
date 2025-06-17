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
    setProgressMessage("Mengekstrak XML dari PDF...");

    const formData = new FormData();
    formData.append("pdf_file", file);

    try {
      setProgressMessage("Mengonversi ke Excel...");

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
            setProgressMessage(`Mengunggah file: ${percentCompleted}% selesai`);
          },
        }
      );

      // Buat URL untuk file blob
      const url = window.URL.createObjectURL(new Blob([response.data]));

      // Buat elemen <a> untuk memicu download
      const link = document.createElement("a");
      link.href = url;

      // Dapatkan nama file dari header atau buat default
      const contentDisposition = response.headers["content-disposition"];
      let fileName = "hasil-konversi.xlsx";

      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
        if (fileNameMatch && fileNameMatch[1]) {
          fileName = fileNameMatch[1];
        }
      }

      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();

      // Bersihkan
      link.remove();
      window.URL.revokeObjectURL(url);

      setProgressMessage("Konversi berhasil! File sedang diunduh...");

      // Panggil fungsi onSubmit untuk menandai submit selesai
      onSubmit(data);

      setTimeout(() => setIsProcessing(false), 2000);
    } catch (error: any) {
      console.error("Error processing file", error);
      setProgressMessage(
        `Error: ${error.response?.data?.detail || error.message}`
      );
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

              <button
                type="submit"
                disabled={isProcessing}
                className={`px-4 py-2 rounded w-full ${
                  isProcessing
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
              >
                {isProcessing ? "Memproses..." : "Konversi ke Excel dan Submit"}
              </button>

              {isProcessing && (
                <div className="mt-4 p-3 bg-blue-50 rounded-md">
                  <p className="text-blue-700">{progressMessage}</p>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{
                        width: progressMessage.includes("%")
                          ? progressMessage.match(/\d+%/)![0]
                          : "50%",
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </form>
    </FormProvider>
  );
}
