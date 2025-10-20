"use client";

import { columns, Certificate } from "./columns";
import { DataTable } from "./data-table";
import { useEffect, useState } from "react";
import { FileText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function DashboardClient() {
  const { t } = useLanguage();

  const [data, setData] = useState<Certificate[]>([]);

  async function getData(): Promise<Certificate[]> {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/dcc/list", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      if (!response.ok) {
        if (response.status === 403) {
          console.error("Access denied - Officer role required");
          return [];
        }
        throw new Error("Failed to fetch data");
      }

      const dccList = await response.json();

      return dccList.map((dcc: any) => ({
        id: dcc.id,
        certificateId: dcc.administrative_data.sertifikat,
        date: dcc.created_at,
        object:
          dcc.objects_description?.[0]?.jenis?.en ||
          dcc.objects_description?.[0]?.jenis?.id,
        submitter: dcc.submitter,
        lab: dcc.responsible_persons?.kepala?.peran.match(/SNSU\s+(.*)/)?.[1],
        status: dcc.status,
      }));
    } catch (error) {
      console.error("Error fetching DCC data:", error);
      return [];
    }
  }

  useEffect(() => {
    getData().then((data) => setData(data));
  }, []);

  const [drafts, setDrafts] = useState<any[]>([]);

  useEffect(() => {
    const loadDrafts = () => {
      const stored = localStorage.getItem('dcc_drafts_electrical');
      if (stored) {
        const parsedDrafts = JSON.parse(stored);
        setDrafts(parsedDrafts);
      }
    };
    
    loadDrafts();
    
    // Refresh drafts periodically
    const interval = setInterval(loadDrafts, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleDeleteDraft = (id: string) => {
    const updatedDrafts = drafts.filter(d => d.id !== id);
    localStorage.setItem('dcc_drafts_electrical', JSON.stringify(updatedDrafts));
    setDrafts(updatedDrafts);
  };

  return (
    <div className="container px-10">
      <div id="draft" className="p-4 my-4 bg-amber-50 rounded-lg border border-amber-200">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileText className="text-amber-600" />
          {t("saved_drafts")}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {drafts.map((draft) => (
            <div key={draft.id} className="flex items-center justify-between p-3 bg-white rounded-md border">
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{draft.name}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(draft.timestamp).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Link href={`/generator/electrical?draft=${draft.id}`}>
                  <Button variant="blue" size="sm">{t("load")}</Button>
                </Link>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleDeleteDraft(draft.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <DataTable columns={columns} data={data} />
    </div>
  );
}