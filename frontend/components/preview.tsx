import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCw, Download, FileText, Eye, AlertCircle } from "lucide-react";

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

  const handlePdfError = () => {
    setPdfError(true);
  };

  const handlePdfLoad = () => {
    setPdfError(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Preview DCC
          </h2>
          <Button
            onClick={onRefresh}
            disabled={isLoading}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Preview
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Generating preview...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* PDF Preview Section */}
            <div className="border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-red-600" />
                PDF Preview
              </h3>
              
              {previewFiles.pdf ? (
                <div className="space-y-4">
                  {/* PDF Viewer */}
                  <div className="border rounded-lg overflow-hidden">
                    {pdfError ? (
                      <div className="flex items-center justify-center py-12 bg-red-50">
                        <div className="text-center">
                          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                          <p className="text-red-700 font-medium mb-2">Failed to load PDF preview</p>
                          <p className="text-red-600 text-sm mb-4">
                            The PDF file might still be generating or there was an error loading it.
                          </p>
                          <Button
                            onClick={() => {
                              setPdfError(false);
                              onRefresh();
                            }}
                            variant="outline"
                            className="flex items-center gap-2"
                          >
                            <RefreshCw className="w-4 h-4" />
                            Try Again
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <iframe
                        src={previewFiles.pdf}
                        width="100%"
                        height="600"
                        title="DCC PDF Preview"
                        className="border-0"
                        onLoad={handlePdfLoad}
                        onError={handlePdfError}
                      />
                    )}
                  </div>
                  
                  {/* PDF Actions */}
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleViewPdf(previewFiles.pdf!)}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View in New Tab
                    </Button>
                    <Button
                      onClick={() => handleDownload(previewFiles.pdf!, 'dcc-preview.pdf')}
                      variant="blue"
                      className="flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download PDF
                    </Button>
                  </div>
                  
                  {/* Debug Info - Remove in production */}
                  <div className="mt-2 p-2 bg-gray-100 rounded text-xs text-gray-600">
                    <strong>Debug:</strong> PDF URL: {previewFiles.pdf}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>PDF preview will appear here</p>
                  <p className="text-sm">Make changes to the form to generate preview</p>
                </div>
              )}
            </div>

            {/* XML Preview Section */}
            {previewFiles.xml && (
              <div className="border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  XML Source
                </h3>
                
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleViewPdf(previewFiles.xml!)}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View XML
                  </Button>
                  <Button
                    onClick={() => handleDownload(previewFiles.xml!, 'dcc-preview.xml')}
                    variant="green"
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download XML
                  </Button>
                </div>
                
                {/* Debug Info - Remove in production */}
                <div className="mt-2 p-2 bg-gray-100 rounded text-xs text-gray-600">
                  <strong>Debug:</strong> XML URL: {previewFiles.xml}
                </div>
              </div>
            )}

            {/* Information Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-blue-900 font-medium mb-1">Preview Information</h4>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• This preview is generated in real-time based on your form data</li>
                    <li>• Changes to the form will automatically update the preview</li>
                    <li>• The preview files are temporary and will be replaced when you make changes</li>
                    <li>• Use the "Submit" button to create the final DCC with embedded XML</li>
                    <li>• If the PDF doesn't load, try refreshing or check the browser console for errors</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}