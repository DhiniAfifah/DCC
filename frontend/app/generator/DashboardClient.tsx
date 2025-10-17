"use client";

import { columns, Certificate } from "./columns";
import { DataTable } from "./data-table";
import { useEffect, useState } from "react";

export default function DashboardClient() {
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

  return (
    <div className="container px-10">
      <DataTable columns={columns} data={data} />
    </div>
  )
}