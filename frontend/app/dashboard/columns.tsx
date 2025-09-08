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
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export type Certificate = {
    id: number
    certificateId: string
    date: string
    object: string
    submitter: string
    status: "pending" | "approved" | "rejected"
}

// Function to update certificate status
const updateCertificateStatus = async (id: number, status: "approved" | "rejected") => {
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
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "certificateId",
    header: ({ column }) => {
      const { t } = useLanguage();
      return (
        <Button
          variant="ghost"
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
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("submission_date")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const rawDate = row.getValue("date") as string;
      const date = new Date(rawDate);
      const formatted = new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(date);

      return <div>{formatted}</div>;
    },
  },
  {
    accessorKey: "object",
    header: ({ column }) => {
      const { t } = useLanguage();
      return (
        <Button
          variant="ghost"
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
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("submitted_by")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      const statuses = ["pending", "approved", "rejected"]

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
            <Button variant="ghost">
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

      const statusStyles: Record<Certificate["status"], string> = {
        pending: "bg-sky-500 text-white",
        approved: "bg-green-600 text-white",
        rejected: "bg-red-600 text-white",
      };

      return (
        <Badge className={statusStyles[status]}>
          {t(status)}
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
 
      const handleStatusChange = async (newStatus: "approved" | "rejected") => {
        try {
          await updateCertificateStatus(certificate.id, newStatus);
          
          // // Show success toast
          // toast({
          //   title: "Success",
          //   description: `Certificate ${newStatus} successfully`,
          // });
          
          // Refresh the page to show updated data
          router.refresh();
        } catch (error) {
          // // Show error toast
          // toast({
          //   title: "Error",
          //   description: `Failed to ${newStatus} certificate`,
          //   variant: "destructive",
          // });
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

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleDownloadPDF}>
              <Download className="mr-2 h-4 w-4" /> 
              {t("download")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => handleStatusChange("approved")}
              disabled={certificate.status === "approved"}
            >
              <Check className="mr-2 h-4 w-4" /> 
              {t("approve")}
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleStatusChange("rejected")}
              disabled={certificate.status === "rejected"}
            >
              <X className="mr-2 h-4 w-4" /> 
              {t("reject")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]