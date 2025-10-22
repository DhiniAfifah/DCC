"use client"
 
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown, ChevronDown, Download, Check, X } from "lucide-react"
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
import { isDirector, isHead } from "@/utils/auth"

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

      return (
        <Badge variant={
            isHead()
              ? status === "pending_head" ? "blue" : 
                status === "approved_head" || status === "approved_director" || status === "rejected_director" ? "green" : 
                status === "rejected_head" ? "red" : 
                "default"
            : isDirector()
              ? status === "approved_head" ? "blue" : 
                status === "approved_director" ? "green" : 
                status === "rejected_director" ? "red" : 
                "default"
              : "default"
        }>
          {isHead()
            ? status === "pending_head" ? t("pending") : 
              status === "approved_head" || status === "approved_director" || status === "rejected_director" ? t("approved") : 
              status === "rejected_head" ? t("rejected") : 
              t("unknown")
          : isDirector()
            ? status === "approved_head" ? t("pending") : 
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
 
      const handleStatusChange = async (newStatus: StatusType) => {
        try {
          await updateCertificateStatus(certificate.id, newStatus);
          router.refresh(); // Refresh the page to show updated data
        } catch (error) {
          // Show error toast
          toast.error("Failed to change certificate status");
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
      
      let approve: StatusType;
      let reject: StatusType;

      if (isHead()) {
        approve = "approved_head";
        reject = "rejected_head";
      } else if (isDirector()) {
        approve = "approved_director";
        reject = "rejected_director";
      }

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
              <DropdownMenuItem onClick={handleDownloadPDF}>
                <Download className="mr-2 h-4 w-4 text-sky-500" /> 
                {t("download")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuItem 
                    onClick={() => handleStatusChange(approve)}
                    disabled={
                      (isHead() && (certificate.status === "approved_head" || certificate.status === "rejected_head")) ||
                      (isDirector() && (certificate.status === "approved_director" || certificate.status === "rejected_director"))
                    }
                  >
                    <Check className="mr-2 h-4 w-4 text-green-600" /> 
                    {t("approve")}
                  </DropdownMenuItem>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t("cant_undo")}</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuItem 
                    onClick={() => handleStatusChange(reject)}
                    disabled={
                      (isHead() && (certificate.status === "approved_head" || certificate.status === "rejected_head")) ||
                      (isDirector() && (certificate.status === "approved_director" || certificate.status === "rejected_director"))
                    }
                  >
                    <X className="mr-2 h-4 w-4 text-red-600" /> 
                    {t("reject")}
                  </DropdownMenuItem>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t("cant_undo")}</p>
                </TooltipContent>
              </Tooltip>
            </DropdownMenuContent>
          </DropdownMenu>
        </TooltipProvider>
      )
    },
  },
]