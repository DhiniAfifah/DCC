import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCw, FileText, SquareArrowOutUpRight, AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import { useLanguage } from '@/context/LanguageContext';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coy } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface PreviewProps {
  previewFiles: {
    pdf: string | null;
    xml: string | null;
  };
  isLoading: boolean;
  onRefresh: () => void;
}

export default function Preview({ previewFiles, isLoading, onRefresh }: PreviewProps) {
  const [pdfError, setPdfError] = useState(false);
  const [xmlText, setXmlText] = useState<string | null>(null);
  const [xmlLoading, setXmlLoading] = useState(false);
  const [xmlError, setXmlError] = useState<string | null>(null);

  const { t } = useLanguage();

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewPdf = (url: string) => {
    window.open(url, '_blank');
  };

  const handlePdfError = () => setPdfError(true);
  const handlePdfLoad = () => setPdfError(false);

  // Fetch XML when previewFiles.xml changes
  useEffect(() => {
    const fetchXml = async () => {
      setXmlText(null);
      setXmlError(null);

      if (!previewFiles.xml) return;

      setXmlLoading(true);
      try {
        const res = await fetch(previewFiles.xml, { method: 'GET' });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const text = await res.text();

        // Try to pretty-print the XML
        try {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(text, "application/xml");
          const parserError = xmlDoc.getElementsByTagName("parsererror")[0];
          if (parserError) {
            // Not valid XML (or parser returned error) — show raw text
            setXmlText(text);
          } else {
            const pretty = formatXml(xmlDoc);
            setXmlText(pretty);
          }
        } catch (e) {
          setXmlText(text);
        }
      } catch (err: any) {
        console.error("Failed to fetch XML:", err);
        setXmlError(err?.message || "Failed to fetch XML");
      } finally {
        setXmlLoading(false);
      }
    };

    fetchXml();
  }, [previewFiles.xml]);

  // Simple XML formatter: serialize DOM with indentation
  const formatXml = (xmlDoc: Document) => {
    const serializer = new XMLSerializer();
    const xmlString = serializer.serializeToString(xmlDoc.documentElement);
    // A crude but commonly used pretty-printer:
    const PADDING = "  ";
    const reg = /(>)(<)(\/*)/g;
    let xml = xmlString.replace(reg, "$1\r\n$2$3");
    let pad = 0;
    return xml.split("\r\n").map((node) => {
      let indent = "";
      if (node.match(/.+<\/\w[^>]*>$/)) {
        indent = PADDING.repeat(pad);
      } else if (node.match(/^<\/\w/)) {
        pad = Math.max(pad - 1, 0);
        indent = PADDING.repeat(pad);
      } else if (node.match(/^<\w([^>]*[^/])?>.*$/)) {
        indent = PADDING.repeat(pad);
        pad++;
      } else {
        indent = PADDING.repeat(pad);
      }
      return indent + node;
    }).join("\n");
  };

  const copyXmlToClipboard = async () => {
    if (!xmlText) return;
    try {
      await navigator.clipboard.writeText(xmlText);
      // optionally show small toast / UI feedback
      alert("XML copied to clipboard");
    } catch {
      alert("Failed to copy");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div className="flex gap-2 items-center">
            <Button
              onClick={onRefresh}
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw />
              {t('refresh')}
            </Button>
          </div>
        </CardHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
              <p className="text-gray-600">{t("generate")}...</p>
            </div>
          </div>
        ) : (
          <CardContent className='space-y-6'>
            {/* PDF Preview Section */}
            <div className="border rounded-lg p-6">
              <div className='flex justify-between items-center mb-4'>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-red-600" />
                  PDF
                </h3>

                <Button
                  onClick={() => handleViewPdf(previewFiles.pdf!)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <SquareArrowOutUpRight className="w-4 h-4" />
                  {t("tab")}
                </Button>
              </div>
              
              {previewFiles.pdf ? (
                <div className="space-y-4">
                  <div className="border rounded-lg overflow-hidden">
                    {pdfError ? (
                      <div className="flex items-center justify-center py-12 bg-red-50">
                        <div className="text-center">
                          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                          <p className="text-red-700 font-medium mb-2">{t("fail")}</p>
                          <p className="text-red-600 text-sm mb-4">{t("might")}</p>
                          <Button
                            onClick={() => {
                              setPdfError(false);
                              onRefresh();
                            }}
                            variant="outline"
                            className="flex items-center gap-2"
                          >
                            <RefreshCw className="w-4 h-4" />
                            {t("try")}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <embed
                        src={previewFiles.pdf}
                        type="application/pdf"
                        width="100%"
                        height="500px"
                        onError={handlePdfError}
                        onLoad={handlePdfLoad}
                      />
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t("appear")}</p>
                  <p className="text-sm">{t("changes")}</p>
                </div>
              )}
            </div>

            {/* XML Preview Section */}
            <div className="border rounded-lg p-6">
              <div className='flex justify-between items-center mb-4'>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  XML
                </h3>

                <Button
                  onClick={() => handleViewPdf(previewFiles.xml!)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <SquareArrowOutUpRight className="w-4 h-4" />
                  {t("tab")}
                </Button>
              </div>

              {!previewFiles.xml && (
                <div className="text-center py-6 text-gray-500">
                  <p>{t("available")}</p>
                </div>
              )}

              {previewFiles.xml && (
                <div>
                  {xmlLoading ? (
                    <p className="text-sm text-gray-600">{t("loading")}...</p>
                  ) : xmlError ? (
                    <div className="text-sm text-red-600">
                      {t("xml_error")}: {xmlError}
                    </div>
                  ) : xmlText ? (
                    <SyntaxHighlighter
                      language="xml"
                      style={coy}
                      customStyle={{
                        maxHeight: '420px',
                        overflow: 'auto',
                        fontSize: '0.875rem',
                        background: 'transparent',
                      }}
                    >
                      {xmlText}
                    </SyntaxHighlighter>
                  ) : (
                    <p className="text-sm text-gray-600">{t("after")}</p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}