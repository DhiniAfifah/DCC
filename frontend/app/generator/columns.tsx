"use client"
 
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown, ChevronDown, Eye, Download, RefreshCw, AlertCircle, FileText, FileCode, SquareArrowOutUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLanguage } from "@/context/LanguageContext";
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coy } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useState, useEffect } from "react"

export type Certificate = {
    id: number
    certificateId: string
    date: string
    object: string
    submitter: string
    lab: string
    status: "pending_head" | "approved_head" | "rejected_head" | "approved_director" | "rejected_director"
}

type StatusType =
  | "approved_head"
  | "rejected_head"
  | "approved_director"
  | "rejected_director";

// Function to update certificate status
const updateCertificateStatus = async (id: number, status: StatusType) => {
  try {
    const response = await fetch(`http://127.0.0.1:8000/api/dcc/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error('Failed to update status');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating status:', error);
    throw error;
  }
};

const downloadDCCPDF = async (id: number, certificateId: string) => {
  try {
    const response = await fetch(`http://127.0.0.1:8000/download-dcc-pdf/${id}`, {
      method: 'GET',
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('PDF file not found');
      }
      throw new Error('Failed to download PDF');
    }

    // Create blob from response
    const blob = await response.blob();
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${id}_${certificateId}.pdf`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Error downloading PDF:', error);
    throw error;
  }
};

const downloadDCCXML = async (id: number, certificateId: string) => {
  try {
    const response = await fetch(`http://127.0.0.1:8000/download-dcc-xml/${id}`, {
      method: 'GET',
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('XML file not found');
      }
      throw new Error('Failed to download XML');
    }

    // Create blob from response
    const blob = await response.blob();
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${id}_${certificateId}.xml`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Error downloading XML:', error);
    throw error;
  }
};

export const columns: ColumnDef<Certificate>[] = [
  {
    id: "number",
    header: () => <div className="text-center px-4 py-2">No.</div>,
    cell: ({ row, table }) => {
      const sortedRows = table.getSortedRowModel().rows;
      const displayIndex = sortedRows.findIndex(r => r.id === row.id);
      return <div className="text-center text-muted-foreground">{displayIndex + 1}</div>;
    },
  },
  {
    accessorKey: "certificateId",
    header: ({ column }) => {
      const { t } = useLanguage();
      return (
        <Button
          variant="ghost"
          className="font-bold"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("certificate_id")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "date",
    header: ({ column }) => {
      const { t } = useLanguage();
      return (
        <Button
          variant="ghost"
          className="font-bold"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("submission_date")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const rawDate = row.getValue("date") as string;
    
      // Handle null, undefined, or empty string
      if (!rawDate) {
        return <div className="text-muted-foreground"></div>;
      }
      
      try {
        const date = new Date(rawDate);
        
        // Check if date is valid
        if (isNaN(date.getTime())) {
          return <div className="text-muted-foreground"></div>;
        }
        
        const formatted = new Intl.DateTimeFormat("en-GB", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }).format(date);

        return <div>{formatted}</div>;
      } catch (error) {
        return <div className="text-muted-foreground"></div>;
      }
    },
  },
  {
    accessorKey: "object",
    header: ({ column }) => {
      const { t } = useLanguage();
      return (
        <Button
          variant="ghost"
          className="font-bold"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("calibrated_object")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "submitter",
    header: ({ column }) => {
      const { t } = useLanguage();
      return (
        <Button
          variant="ghost"
          className="font-bold"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("submitted_by")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "lab",
    header: ({ column }) => {
      const { t } = useLanguage();
      return (
        <Button
          variant="ghost"
          className="font-bold"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("lab")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      const statuses = ["pending_head", "approved_head", "rejected_head", "approved_director", "rejected_director"]

      const selectedStatuses = column.getFilterValue() as string[] || []

      const toggleStatus = (status: string) => {
        const next = selectedStatuses.includes(status)
          ? selectedStatuses.filter(s => s !== status)
          : [...selectedStatuses, status]
        column.setFilterValue(next.length ? next : undefined)
      }

      const { t } = useLanguage()

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="font-bold">
              Status <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {statuses.map(status => (
              <DropdownMenuCheckboxItem
                key={status}
                checked={selectedStatuses.includes(status)}
                onCheckedChange={() => toggleStatus(status)}
              >
                {t(`${status}`)}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
    cell: ({ row }) => {
      const { t } = useLanguage()
      const status = row.getValue("status") as Certificate["status"]

      return (
        <Badge 
          variant={
            status === "pending_head" ? "blue" : 
            status === "approved_head" ? "teal" : 
            status === "rejected_head" ? "red" : 
            status === "approved_director" ? "green" : 
            status === "rejected_director" ? "red" : 
            "default"
          }
          className="whitespace-nowrap"
        >
          {
            status === "pending_head" ? t("pending_head") : 
            status === "approved_head" ? t("approved_head") : 
            status === "rejected_head" ? t("rejected_head") : 
            status === "approved_director" ? t("approved_director") : 
            status === "rejected_director" ? t("rejected_director") : 
            t("unknown")
          }
        </Badge>
      );
    },
    enableColumnFilter: true,
    filterFn: (row, columnId, filterValue) => {
      return filterValue.includes(row.getValue(columnId))
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const { t } = useLanguage();
      const router = useRouter();
      const certificate = row.original;

      const handleDownloadPDF = async () => {
        try {
          await downloadDCCPDF(certificate.id, certificate.certificateId);
        } catch (error) {
          // Show error message to user
          toast.error(`Failed to download PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      };

      const handleDownloadXML = async () => {
        try {
          await downloadDCCXML(certificate.id, certificate.certificateId);
        } catch (error) {
          // Show error message to user
          toast.error(`Failed to download XML: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      };

      const [dialogOpen, setDialogOpen] = useState(false);
      const [pdfError, setPdfError] = useState(false);
      const [xmlText, setXmlText] = useState<string | null>(null);
      const [xmlLoading, setXmlLoading] = useState(false);
      const [xmlError, setXmlError] = useState<string | null>(null);

      const pdfUrl = `http://127.0.0.1:8000/view-dcc-pdf/${certificate.id}`;
      const xmlUrl = `http://127.0.0.1:8000/view-dcc-xml/${certificate.id}`;

      const handlePdfError = () => setPdfError(true);
      const handlePdfLoad = () => setPdfError(false);

      const formatXml = (xmlDoc: Document) => {
        const serializer = new XMLSerializer();
        const xmlString = serializer.serializeToString(xmlDoc.documentElement);
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

      useEffect(() => {
        const fetchXml = async () => {
          if (!dialogOpen) return;
          
          setXmlText(null);
          setXmlError(null);
          setXmlLoading(true);
          
          try {
            const res = await fetch(xmlUrl, { method: 'GET' });
            if (!res.ok) throw new Error(`Status ${res.status}`);
            const text = await res.text();

            try {
              const parser = new DOMParser();
              const xmlDoc = parser.parseFromString(text, "application/xml");
              const parserError = xmlDoc.getElementsByTagName("parsererror")[0];
              if (parserError) {
                setXmlText(text);
              } else {
                const pretty = formatXml(xmlDoc);
                setXmlText(pretty);
              }
            } catch (e) {
              setXmlText(text);
            }
          } catch (err: any) {
            setXmlError(err?.message || "Failed to fetch XML");
          } finally {
            setXmlLoading(false);
          }
        };

        fetchXml();
      }, [dialogOpen, xmlUrl]);

      const handleViewPdf = (url: string) => {
        window.open(url, '_blank');
      };

      return (
        <TooltipProvider>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {certificate.status !== "approved_director" ? (
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}> 
                      <Eye className="mr-2 h-4 w-4 text-sky-500" />
                      {t("view")}
                    </DropdownMenuItem>
                  </DialogTrigger>
                  <DialogContent className="max-w-[95vw] sm:max-w-3xl md:max-w-4xl lg:max-w-5xl max-h-[90vh] overflow-hidden flex flex-col p-4 sm:p-6">
                    <DialogHeader>
                      <DialogTitle>{t("view")} {certificate.certificateId}</DialogTitle>
                    </DialogHeader>
                    
                    <div className="flex-1 overflow-y-auto space-y-6 py-4">
                      <div id="xml" className="border rounded-lg p-4">
                        <div className='flex justify-between items-center mb-4'>
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            <FileCode className="w-5 h-5 text-green-600" />
                            XML
                          </h3>
                          <div className="flex gap-3">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  onClick={() => window.open(xmlUrl, '_blank')}
                                  variant="outline"
                                  size="sm"
                                  className="flex items-center gap-2"
                                >
                                  <SquareArrowOutUpRight className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{t("tab")}</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  onClick={handleDownloadXML}
                                  variant="blue"
                                  size="sm"
                                  className="flex items-center gap-2"
                                >
                                  <Download className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{t("download")}</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>

                        {xmlLoading ? (
                          <p className="text-sm text-gray-600">{t("loading_xml")}...</p>
                        ) : xmlError ? (
                          <div className="text-sm text-red-600">
                            {t("xml_error")}: {xmlError}
                          </div>
                        ) : xmlText ? (
                          <ScrollArea className="h-[300px] w-full pr-2">
                            <SyntaxHighlighter
                              language="xml"
                              style={coy}
                              customStyle={{
                                fontSize: "0.875rem",
                                background: "transparent",
                                margin: 0,
                                width: "max-content",
                              }}
                            >
                              {xmlText}
                            </SyntaxHighlighter>
                            <ScrollBar orientation="horizontal" />
                          </ScrollArea>
                        ) : (
                          <p className="text-sm text-gray-600">{t("loading")}...</p>
                        )}
                      </div>

                      <div id="pdf" className="border rounded-lg p-4">
                        <div className='flex justify-between items-center mb-4'>
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            <FileText className="w-5 h-5 text-red-600" />
                            PDF
                          </h3>
                          <div className="flex gap-3">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  onClick={() => handleViewPdf(pdfUrl)}
                                  variant="outline"
                                  size="sm"
                                  className="flex items-center gap-2"
                                >
                                  <SquareArrowOutUpRight className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{t("tab")}</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  onClick={handleDownloadPDF}
                                  variant="blue"
                                  size="sm"
                                  className="flex items-center gap-2"
                                >
                                  <Download className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{t("download")}</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                        
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
                                  }}
                                  variant="outline"
                                  size="sm"
                                  className="flex items-center gap-2"
                                >
                                  <RefreshCw className="w-4 h-4" />
                                  {t("try")}
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <embed
                              src={pdfUrl}
                              type="application/pdf"
                              width="100%"
                              height="500px"
                              onError={handlePdfError}
                              onLoad={handlePdfLoad}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ) : (
                <DropdownMenuItem onClick={handleDownloadPDF}>
                  <Download className="mr-2 h-4 w-4 text-sky-500" /> 
                  {t("download")}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </TooltipProvider>
      )
    },
  },
]