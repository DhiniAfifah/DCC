"use client"
 
import { ColumnDef } from "@tanstack/react-table"
import { 
  MoreHorizontal, 
  ArrowUpDown, 
  ChevronDown, 
  Eye, 
  Download, 
  Check, 
  X, 
  RefreshCw, 
  AlertCircle, 
  FileText, 
  FileCode, 
  SquareArrowOutUpRight, 
  MessageSquareText,
  History,
} from "lucide-react"
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
import { isDirector, isHead, getAccessToken } from "@/utils/auth"
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
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"

export type Certificate = {
    id: number
    certificateId: string
    date: string
    object: string
    submitter: string
    lab: string
    status: "pending_head" | "approved_head" | "rejected_head" | "approved_director" | "rejected_director"
    effective_status?: "pending_head" | "approved_head" | "rejected_head" | "approved_director" | "rejected_director"
    rejection_note?: string
    rejector_role?: "head" | "director"
    has_been_rejected?: boolean
    original_dcc_id?: number
    revision_number?: number
    revised_badge?: boolean
    has_been_revised?: boolean
    a_revision_is_approved_by_head?: boolean
    a_revision_is_approved_by_director?: boolean
}

type StatusType =
  | "approved_head"
  | "rejected_head"
  | "approved_director"
  | "rejected_director";

const downloadDCCPDF = async (id: number, certificateId: string) => {
  try {
    const token = getAccessToken();

    const response = await fetch(`http://127.0.0.1:8000/download-dcc-pdf/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
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
    const token = getAccessToken();

    const response = await fetch(`http://127.0.0.1:8000/download-dcc-xml/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
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

function ViewDialog({ 
  certificate, 
  open, 
  onOpenChange 
}: { 
  certificate: Certificate; 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useLanguage();
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
      if (!open) return;
      
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
  }, [open, xmlUrl]);

  const handleDownloadPDF = async () => {
    try {
      await downloadDCCPDF(certificate.id, certificate.certificateId);
    } catch (error) {
      toast.error(`Failed to download PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDownloadXML = async () => {
    try {
      await downloadDCCXML(certificate.id, certificate.certificateId);
    } catch (error) {
      toast.error(`Failed to download XML: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleViewPdf = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <TooltipProvider>
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
            <p className="text-sm text-gray-600">{t("loading")}...</p>
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
    </TooltipProvider>
  );
}

function RejectionDialog({
  certificate,
  reject,
  isUpdating,
  setIsUpdating
}: {
  certificate: Certificate;
  reject: StatusType;
  isUpdating: boolean;
  setIsUpdating: (updating: boolean) => void;
}) {
  const { t } = useLanguage();
  const router = useRouter();
  const [rejectionNote, setRejectionNote] = useState("");

  const handleReject = async () => {
    if (!rejectionNote.trim()) {
      toast.error(t("revision_note_required"));
      return;
    }

    setIsUpdating(true);
    window.dispatchEvent(
      new CustomEvent("certificate-updating", {
        detail: { certificateId: certificate.id, isUpdating: true },
      })
    );

    try {
      const token = getAccessToken();

      const response = await fetch(
        `http://127.0.0.1:8000/api/dcc/${certificate.id}/reject`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: reject,
            rejection_note: rejectionNote,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to reject");
      }

      setRejectionNote("");
      router.refresh();
    } catch (error) {
      console.error("Rejection error:", error);
      toast.error(t("failed_status"));
    } finally {
      setIsUpdating(false);
      window.dispatchEvent(
        new CustomEvent("certificate-updating", {
          detail: { certificateId: certificate.id, isUpdating: false },
        })
      );
    }
  };

  return (
    <>
      <div className="space-y-4 py-4">
        <Textarea
          value={rejectionNote}
          onChange={(e) => setRejectionNote(e.target.value)}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="destructive" onClick={handleReject}>
          <X className="w-4 h-4" />
          {t("reject")}
        </Button>
      </div>
    </>
  );
}

function RejectionNoteDisplay({ certificateId }: { certificateId: number }) {
  const { t } = useLanguage();
  const [note, setNote] = useState<string>("");
  const [rejectedBy, setRejectedBy] = useState<string>("");
  const [rejectedAt, setRejectedAt] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        // Get the token from cookies
        const token = getAccessToken();

        const response = await fetch(
          `http://127.0.0.1:8000/api/dcc/${certificateId}/rejection-note`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          setNote(data.note);
          setRejectedBy(data.rejected_by);
          setRejectedAt(data.rejected_at);
        }
      } catch (error) {
        console.error("Failed to fetch rejection note:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNote();
  }, [certificateId]);

  if (loading) return <p>{t("loading")}...</p>;

  return (
    <div className="space-y-4">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="whitespace-pre-wrap">{note}</p>
      </div>
      {rejectedBy && (
        <div className="text-sm text-muted-foreground">
          <p>{t("rejected_by")}: {rejectedBy}</p>
          {rejectedAt && <p>{t("rejected_at")}: {new Date(rejectedAt).toLocaleString()}</p>}
        </div>
      )}
    </div>
  );
}

function RevisionHistoryDialog({ 
  certificateId,
  certificate,
  openView,
  onOpenChangeView,
}: { 
  certificateId: number;
  certificate: Certificate; 
  openView: boolean; 
  onOpenChangeView: (open: boolean) => void;
}) {
  const { t } = useLanguage();
  const router = useRouter();
  const [revisions, setRevisions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedRevision, setSelectedRevision] = useState<Certificate | null>(null);
  const [rejectingRevisionId, setRejectingRevisionId] = useState<number | null>(null);
  const [rejectionNotes, setRejectionNotes] = useState<{[key: number]: string}>({});
  const [updatingRevisionId, setUpdatingRevisionId] = useState<number | null>(null);

  useEffect(() => {
    const fetchRevisions = async () => {
      if (!open) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('access_token='))
          ?.split('=')[1];

        const response = await fetch(
          `http://127.0.0.1:8000/api/dcc/${certificateId}/revisions`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch revisions');
        }
        
        const data = await response.json();
        
        if (isDirector()) {
          const filteredRevisions = data.filter((rev: any) => 
            rev.status === "approved_head" || 
            rev.status === "approved_director" || 
            rev.status === "rejected_director"
          );
          setRevisions(filteredRevisions);
        } else {
          setRevisions(data);
        }
      } catch (err) {
        console.error('Error fetching revisions:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchRevisions();
  }, [certificateId, open]);

  const getStatusBadge = (status: string) => {
    // Head
    const baseStatusMap: Record<string, { variant: any; text: string }> = {
      pending_head: { variant: "blue", text: t("pending") },
      approved_head: { variant: "green", text: t("approved") },
      rejected_head: { variant: "red", text: t("rejected") },
      approved_director: { variant: "green", text: t("approved") },
      rejected_director: { variant: "green", text: t("approved") },
    };

    // Clone map so mutation is safe
    const statusMap = { ...baseStatusMap };

    // Director
    if (isDirector()) {
      statusMap.approved_head = { variant: "blue", text: t("pending") };
      statusMap.rejected_director = { variant: "red", text: t("rejected") };
    }

    const config = statusMap[status] || {
      variant: "default",
      text: t("unknown"),
    };

    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch {
      return "Invalid date";
    }
  };

  const handleApproveRevision = async (revisionId: number) => {
    setUpdatingRevisionId(revisionId);
    
    try {
      const token = getAccessToken();
      let approve: StatusType = "approved_head";
      
      if (isDirector()) {
        approve = "approved_director";
      }

      const response = await fetch(`http://127.0.0.1:8000/api/dcc/${revisionId}/approve`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: approve }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to approve revision');
      }
      
      toast.success(t("status_changed"));
      
      // Refresh revisions list
      const revisionsResponse = await fetch(
        `http://127.0.0.1:8000/api/dcc/${certificateId}/revisions`,
        { headers: { 'Authorization': `Bearer ${token}` }}
      );
      
      if (revisionsResponse.ok) {
        const data = await revisionsResponse.json();
        
        if (isDirector()) {
          const filteredRevisions = data.filter((rev: any) => 
            rev.status === "approved_head" || 
            rev.status === "approved_director" || 
            rev.status === "rejected_director"
          );
          setRevisions(filteredRevisions);
        } else {
          setRevisions(data);
        }
      }
      
      router.refresh();
    } catch (error) {
      console.error('Approval error:', error);
      toast.error(t("failed_status"));
    } finally {
      setUpdatingRevisionId(null);
    }
  };

  const handleRejectRevision = async (revisionId: number) => {
    const rejectionNote = rejectionNotes[revisionId];
    
    if (!rejectionNote?.trim()) {
      toast.error(t("revision_note_required"));
      return;
    }

    setUpdatingRevisionId(revisionId);
    
    try {
      const token = getAccessToken();
      let reject: StatusType = "rejected_head";
      
      if (isDirector()) {
        reject = "rejected_director";
      }

      const response = await fetch(`http://127.0.0.1:8000/api/dcc/${revisionId}/reject`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          status: reject,
          rejection_note: rejectionNote 
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to reject revision');
      }
      
      toast.success(t("status_changed"));
      setRejectingRevisionId(null);
      setRejectionNotes(prev => ({ ...prev, [revisionId]: "" }));
      
      // Refresh revisions list
      const revisionsResponse = await fetch(
        `http://127.0.0.1:8000/api/dcc/${certificateId}/revisions`,
        { headers: { 'Authorization': `Bearer ${token}` }}
      );
      
      if (revisionsResponse.ok) {
        const data = await revisionsResponse.json();
        
        if (isDirector()) {
          const filteredRevisions = data.filter((rev: any) => 
            rev.status === "approved_head" || 
            rev.status === "approved_director" || 
            rev.status === "rejected_director"
          );
          setRevisions(filteredRevisions);
        } else {
          setRevisions(data);
        }
      }
      
      router.refresh();
    } catch (error) {
      console.error('Rejection error:', error);
      toast.error(t("failed_status"));
    } finally {
      setUpdatingRevisionId(null);
    }
  };

  const handleDownloadRevisionPDF = async (revisionId: number) => {
    try {
      await downloadDCCPDF(revisionId, certificate.certificateId);
    } catch (error) {
      toast.error(`Failed to download PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="py-4">
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Spinner className="h-8 w-8" />
          <span className="ml-2">{t("loading")}...</span>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-8 text-red-600">
          <AlertCircle className="w-5 h-5 mr-2" />
          Error: {error}
        </div>
      ) : revisions.length === 0 ? (
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          {t("no_revisions_found")}
        </div>
      ) : (
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {revisions.map((revision, index) => (
              <div 
                key={revision.id}
                className="border rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">
                      {index === 0 
                        ? t("original") 
                        : `${t("revision")} ${index}`}
                    </h4>
                  </div>
                  {getStatusBadge(revision.status)}
                </div>
                <div className="text-sm space-y-1">
                  <p>
                    <span className="font-medium">{t("submission_date")}:</span>{" "}
                    {formatDate(revision.created_at)}
                  </p>
                  <p>
                    <span className="font-medium">{t("database_id")}:</span> {revision.id}
                  </p>
                  {(revision.status === "rejected_head" || revision.status === "rejected_director") && (
                    <>
                      <p>
                        <span className="font-medium">{t("revision_note")}:</span>
                      </p>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="whitespace-pre-wrap">{revision.rejection_note}</div>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex justify-between gap-2 mt-3">
                  {revision.status !== "approved_director" ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={() => {
                        // Create a Certificate object for the revision
                        setSelectedRevision({
                          id: revision.id,
                          certificateId: certificate.certificateId,
                          date: revision.created_at,
                          object: certificate.object,
                          submitter: certificate.submitter,
                          lab: certificate.lab,
                          status: revision.status as any,
                          original_dcc_id: certificate.id,
                          revision_number: revision.revision_number,
                        });
                        setViewDialogOpen(true);
                      }}
                    >
                      <Eye className="w-4 h-4 text-sky-500" />
                      {t("view")}
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={() => handleDownloadRevisionPDF(revision.id)}
                    >
                      <Download className="w-4 h-4 text-sky-500" />
                      {t("download")}
                    </Button>
                  )}

                  <div className="flex gap-2">
                    {
                      !(
                        (isHead() && (
                          revision.status === "approved_head" || revision.status === "rejected_head" || revision.status === "approved_director" || revision.status === "rejected_director"
                        )) || 
                        (isDirector() && (
                          revision.status === "approved_director" || revision.status === "rejected_director"
                        ))
                      ) && (
                        <>
                          {rejectingRevisionId !== revision.id && (
                            <>
                              <Button 
                                variant="green"
                                size="sm"onClick={() => handleApproveRevision(revision.id)}
                                disabled={updatingRevisionId === revision.id}
                              >
                                {updatingRevisionId === revision.id ? (
                                  <Spinner className="h-4 w-4 mr-1" />
                                ) : (
                                  <Check className="h-4 w-4" />
                                )}
                                {t("approve")}
                              </Button>

                              <Button 
                                variant="destructive"
                                size="sm"
                                onClick={() => {setRejectingRevisionId(revision.id)}}
                                disabled={updatingRevisionId === revision.id}
                              >
                                {updatingRevisionId === revision.id ? (
                                  <Spinner className="h-4 w-4 mr-1" />
                                ) : (
                                  <X className="h-4 w-4" />
                                )}
                                {t("reject")}
                              </Button>
                            </>
                          )}
                        </>
                      )
                    }
                  </div>
                </div>

                {rejectingRevisionId === revision.id && (
                  <div className="mt-3 space-y-2">
                    <Textarea
                      value={rejectionNotes[revision.id] || ""}
                      onChange={(e) => setRejectionNotes(prev => ({
                        ...prev,
                        [revision.id]: e.target.value
                      }))}
                      placeholder={t("revision_note")}
                    />
                    <div className="flex justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setRejectingRevisionId(null);
                          setRejectionNotes(prev => ({ ...prev, [revision.id]: "" }));
                        }}
                      >
                        {t("cancel")}
                      </Button>

                      <Button 
                        variant="destructive"
                        size="sm"
                        onClick={() => {handleRejectRevision(revision.id)}}
                        disabled={updatingRevisionId === revision.id}
                      >
                        {updatingRevisionId === revision.id ? (
                          <Spinner className="h-4 w-4 mr-1" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                        {t("reject")}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      {selectedRevision && (
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-[95vw] sm:max-w-3xl md:max-w-4xl lg:max-w-5xl max-h-[90vh] overflow-hidden flex flex-col p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle>{t("view")} {certificate.certificateId}</DialogTitle>
            </DialogHeader>
            <ViewDialog 
              certificate={selectedRevision}
              open={viewDialogOpen}
              onOpenChange={setViewDialogOpen}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

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
                className="capitalize"
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
      const certificate = row.original

      const [hasPendingHeadRevision, setHasPendingHeadRevision] = useState(false)
      const [hasRejectedHeadRevision, setHasRejectedHeadRevision] = useState(false)
      const [hasApprovedHeadRevision, setHasApprovedHeadRevision] = useState(false)
      const [hasRejectedDirectorRevision, setHasRejectedDirectorRevision] = useState(false)
      const [hasApprovedDirectorRevision, setHasApprovedDirectorRevision] = useState(false)

      const [isUpdating, setIsUpdating] = useState(false)
      const [loading, setLoading] = useState(false)

      // Listen for updates from the actions cell
      useEffect(() => {
        const handleUpdate = (event: CustomEvent) => {
          if (event.detail.certificateId === certificate.id) {
            setIsUpdating(event.detail.isUpdating)
          }
        }

        window.addEventListener('certificate-updating' as any, handleUpdate as any)
        return () => {
          window.removeEventListener('certificate-updating' as any, handleUpdate as any)
        }
      }, [certificate.id])

      useEffect(() => {
        const checkRevisions = async () => {
          setLoading(true)

          try {
            const token = document.cookie
              .split('; ')
              .find(row => row.startsWith('access_token='))
              ?.split('=')[1]

            const response = await fetch(
              `http://127.0.0.1:8000/api/dcc/${certificate.id}/revisions`,
              {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              }
            )
            
            if (response.ok) {
              const revisions = await response.json();

              const pending_head = revisions.some(
                (rev: any) => rev.status === "pending_head"
              );
              const rejected_head = revisions.some(
                (rev: any) => rev.status === "rejected_head"
              );
              const approved_head = revisions.some(
                (rev: any) => rev.status === "approved_head"
              );
              const rejected_director = revisions.some(
                (rev: any) => rev.status === "rejected_director"
              );
              const approved_director = revisions.some(
                (rev: any) => rev.status === "approved_director"
              );

              setHasPendingHeadRevision(pending_head);
              setHasRejectedHeadRevision(rejected_head);
              setHasApprovedHeadRevision(approved_head);
              setHasRejectedDirectorRevision(rejected_director);
              setHasApprovedDirectorRevision(approved_director);
            }
          } catch (err) {
            console.error('Error checking revisions:', err)
          } finally {
            setLoading(false)
          }
        }

        checkRevisions()
      }, [certificate.id])

      return (
        <Badge variant={
          isHead()
            ? 
              hasPendingHeadRevision ? "blue" :
              hasApprovedHeadRevision || hasRejectedDirectorRevision || hasApprovedDirectorRevision ? "green" :
              hasRejectedHeadRevision ? "red" :
              status === "pending_head" ? "blue" : 
              status === "approved_head" || status === "approved_director" || status === "rejected_director" ? "green" : 
              status === "rejected_head" ? "red" : 
              "default"
          : isDirector()
            ? 
              hasApprovedDirectorRevision ? "green" :
              hasApprovedHeadRevision ? "blue" :
              hasRejectedDirectorRevision ? "red" :
              status === "approved_head" ? "blue" : 
              status === "approved_director" ? "green" : 
              status === "rejected_director" ? "red" : 
              "default"
            : "default"
        }>
          {isUpdating && <Spinner className="mr-1" />}
          {
            isHead()
              ? 
                hasPendingHeadRevision ? t("pending") :
                hasApprovedHeadRevision || hasRejectedDirectorRevision || hasApprovedDirectorRevision ? t("approved") :
                hasRejectedHeadRevision ? t("rejected") :
                status === "pending_head" ? t("pending") : 
                status === "approved_head" || status === "approved_director" || status === "rejected_director" ? t("approved") : 
                status === "rejected_head" ? t("rejected") : 
                t("unknown")
            : isDirector()
              ? 
                hasApprovedDirectorRevision ? t("approved") :
                hasApprovedHeadRevision ? t("pending") :
                hasRejectedDirectorRevision ? t("rejected") :
                status === "approved_head" ? t("pending") : 
                status === "approved_director" ? t("approved") : 
                status === "rejected_director" ? t("rejected") : 
                t("unknown")
            : t("unknown")
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

      const [isUpdating, setIsUpdating] = useState(false);
 
      const handleStatusChange = async (newStatus: StatusType) => {
        setIsUpdating(true);
        // Dispatch event to update badge
        window.dispatchEvent(new CustomEvent('certificate-updating', { 
          detail: { certificateId: certificate.id, isUpdating: true } 
        }))
        
        try {
          // Get the token from cookies
          const token = getAccessToken();

          const response = await fetch(`http://127.0.0.1:8000/api/dcc/${certificate.id}/approve`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ status: newStatus }),
          });

          if (!response.ok) {
            throw new Error('Failed to update status');
          }

          const result = await response.json();
          router.refresh(); // Refresh the page to show updated status
          return result;

        } catch (error) {
          console.error('Error updating status:', error);
          toast.error(t("failed_status"));
          throw error;
        } finally {
          setIsUpdating(false);
          // Dispatch event to stop updating badge
          window.dispatchEvent(new CustomEvent('certificate-updating', { 
            detail: { certificateId: certificate.id, isUpdating: false } 
          }))
        }
      };

      const handleDownloadPDF = async () => {
        try {
          await downloadDCCPDF(certificate.id, certificate.certificateId);
        } catch (error) {
          // Show error message to user
          toast.error(`Failed to download PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      };
      
      let approve: StatusType = "approved_head";
      let reject: StatusType = "rejected_head";

      if (isHead()) {
        approve = "approved_head";
        reject = "rejected_head";
      } else if (isDirector()) {
        approve = "approved_director";
        reject = "rejected_director";
      }

      const [viewDialogOpen, setViewDialogOpen] = useState(false);
      const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
      const [revisionDialogOpen, setRevisionDialogOpen] = useState(false);

      const [hasApprovedHeadRevision, setHasApprovedHeadRevision] = useState(false)
      const [hasRejectedDirectorRevision, setHasRejectedDirectorRevision] = useState(false)
      const [hasApprovedDirectorRevision, setHasApprovedDirectorRevision] = useState(false)

      useEffect(() => {
        const checkRevisions = async () => {
          try {
            const token = document.cookie
              .split('; ')
              .find(row => row.startsWith('access_token='))
              ?.split('=')[1]

            const response = await fetch(
              `http://127.0.0.1:8000/api/dcc/${certificate.id}/revisions`,
              {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              }
            )
            
            if (response.ok) {
              const revisions = await response.json();

              const approved_head = revisions.some(
                (rev: any) => rev.status === "approved_head"
              );
              const rejected_director = revisions.some(
                (rev: any) => rev.status === "rejected_director"
              );
              const approved_director = revisions.some(
                (rev: any) => rev.status === "approved_director"
              );

              setHasApprovedHeadRevision(approved_head);
              setHasRejectedDirectorRevision(rejected_director);
              setHasApprovedDirectorRevision(approved_director);
            }
          } catch (err) {
            console.error('Error checking revisions:', err)
          }
        }

        checkRevisions()
      }, [certificate.id])

      return (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {
              (
                (isDirector() && !certificate.has_been_revised && certificate.status !== "approved_director") || isHead()
              ) && !certificate.has_been_revised && certificate.status !== "approved_director"  && (
                <Dialog>
                  <DialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => {
                      e.preventDefault();
                      setViewDialogOpen(true);
                    }}> 
                      <Eye className="mr-2 h-4 w-4 text-sky-500" />
                      {t("view")}
                    </DropdownMenuItem>
                  </DialogTrigger>
                  <DialogContent className="max-w-[95vw] sm:max-w-3xl md:max-w-4xl lg:max-w-5xl max-h-[90vh] overflow-hidden flex flex-col p-4 sm:p-6">
                    <DialogHeader>
                      <DialogTitle>{t("view")} {certificate.certificateId}</DialogTitle>
                    </DialogHeader>
                    <ViewDialog 
                      certificate={certificate}
                      open={viewDialogOpen}
                      onOpenChange={setViewDialogOpen}
                    />
                  </DialogContent>
                </Dialog>
              )
            }
            
            {certificate.status === "approved_director" && (
              <DropdownMenuItem onClick={handleDownloadPDF}>
                <Download className="mr-2 h-4 w-4 text-sky-500" /> 
                {t("download")}
              </DropdownMenuItem>
            )}

            {
              (
                (isDirector() && (hasApprovedHeadRevision || hasRejectedDirectorRevision || hasApprovedDirectorRevision)) || isHead()
              ) && certificate.has_been_revised && (
                <Dialog open={revisionDialogOpen} onOpenChange={setRevisionDialogOpen}>
                  <DialogTrigger asChild>
                    <DropdownMenuItem 
                      onSelect={(e) => {
                        e.preventDefault();
                        setRevisionDialogOpen(true);
                      }}
                    >
                      <History className="mr-2 h-4 w-4 text-purple-600" />
                      {t("Revision_history")}
                    </DropdownMenuItem>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <History className="w-5 h-5" />
                        {t("Revision_History")}
                      </DialogTitle>
                    </DialogHeader>
                    <RevisionHistoryDialog 
                      certificateId={certificate.id}
                      certificate={certificate}
                      openView={viewDialogOpen}
                      onOpenChangeView={setViewDialogOpen}
                    />
                  </DialogContent>
                </Dialog>
              )
            }

            {
              !(
                (isHead() && (
                  certificate.status === "approved_head" || certificate.status === "rejected_head" || certificate.status === "approved_director" || certificate.status === "rejected_director"
                )) || 
                (isDirector() && (
                  certificate.status === "approved_director" || certificate.status === "rejected_director"
                ))
              ) && (
                <>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem 
                    onClick={() => handleStatusChange(approve)}
                    disabled={isUpdating}
                  >
                    <Check className="mr-2 h-4 w-4 text-green-600" /> 
                    {t("approve")}
                  </DropdownMenuItem>
              
                  <DropdownMenuItem 
                    onSelect={(e) => {
                      e.preventDefault();
                      setTimeout(() => {
                        setRejectDialogOpen(true);
                      }, 0);
                    }}
                    disabled={isUpdating}
                  >
                    <X className="mr-2 h-4 w-4 text-red-600" /> 
                    {t("reject")}
                  </DropdownMenuItem>

                  <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-x-2">
                          <MessageSquareText className="w-5 h-5" /> 
                          {t("revision_note")}
                        </DialogTitle>
                      </DialogHeader>
                      <RejectionDialog
                        certificate={certificate}
                        reject={reject}
                        isUpdating={isUpdating}
                        setIsUpdating={setIsUpdating}
                      />
                    </DialogContent>
                  </Dialog>
                </>
              )
            }

            {
              (
                (isDirector() && certificate.status === "rejected_director") || (isHead() && certificate.status === "rejected_head")
              ) && !certificate.has_been_revised && (
                <>
                  <DropdownMenuSeparator />

                  <Dialog>
                    <DialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <MessageSquareText className="mr-2 h-4 w-4 text-red-600" />
                        {t("revision_note")}
                      </DropdownMenuItem>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-x-2">
                          <MessageSquareText className="w-5 h-5" /> 
                          {t("revision_note")}
                        </DialogTitle>
                      </DialogHeader>
                      <RejectionNoteDisplay certificateId={certificate.id} />
                    </DialogContent>
                  </Dialog>
                </>
              )
            }
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]