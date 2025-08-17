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
import { FileText, FileCode } from "lucide-react";
import axios from "axios";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const createFormSchema = (activeTab: string) => {
  return z.object({
    pdf: activeTab === "pdf" 
      ? (typeof window === "undefined" ? z.any() : z.instanceof(FileList))
      : z.any().optional(),
    xml: activeTab === "xml" 
      ? (typeof window === "undefined" ? z.any() : z.instanceof(FileList))
      : z.any().optional(),
  });
};

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
  const [activeTab, setActiveTab] = useState("pdf");

  const form = useForm({
    resolver: zodResolver(createFormSchema(activeTab)),
    defaultValues: formData,
  });

  const pdfFireRef = form.register("pdf");
  const xmlFireRef = form.register("xml");

  const handleFormSubmit = async (data: any) => {
    const file = activeTab === "pdf" ? data.pdf?.[0] : data.xml?.[0];
    if (!file) {
      console.error("No file selected!");
      return;
    }

    setIsProcessing(true);
    setProgressMessage(t("extract"));
    setProgressPercent(10);
    setDownloadUrl(null); // Reset previous download

    const formData = new FormData();
    formData.append(activeTab === "pdf" ? "pdf_file" : "xml_file", file);

    try {
      setProgressMessage(t("converting"));
      setProgressPercent(25);

      const response = await axios.post(
        activeTab === "pdf"
          ? "http://127.0.0.1:8000/upload-pdf/"
          : "http://127.0.0.1:8000/upload-xml/",
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

      let fileName = file.name.replace(/\.[^/.]+$/, "") + ".xlsx";
      
      const contentDisposition = response.headers["content-disposition"];

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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pdf">PDF</TabsTrigger>
              <TabsTrigger value="xml">XML</TabsTrigger>
            </TabsList>
            <TabsContent value="pdf">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
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
                              {...pdfFireRef}
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
                    <div>
                      <Button asChild variant="blue">
                        <a href={downloadUrl} download={downloadFileName}>
                          {t("download")}
                        </a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="xml">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileCode className="h-5 w-5" />
                    {t("xml_to_excel")}
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
                            <Input
                              type="file"
                              {...xmlFireRef}
                              accept=".xml"
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
                    <div>
                      <Button asChild variant="blue">
                        <a href={downloadUrl} download={downloadFileName}>
                          {t("download")}
                        </a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </form>
    </FormProvider>
  );
}