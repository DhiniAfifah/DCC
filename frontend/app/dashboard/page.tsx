"use client"

import { useEffect, useState } from "react"
import DashboardClient from "./DashboardClient"
import { Certificate } from "./columns"
import { useRouter } from "next/navigation"
import { Spinner } from "@/components/ui/spinner"
import { useLanguage } from "@/context/LanguageContext"
import { getAccessToken, isDirector, isHead } from "@/utils/auth"

export default function Dashboard() {
  const [data, setData] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { t } = useLanguage()

  useEffect(() => {
    async function fetchData() {
      try {
        // Get token from cookies (client-side)
        const token = getAccessToken();

        if (!token) {
          console.error('No authentication token found');
          router.push('/');
          return;
        }

        const response = await fetch("http://127.0.0.1:8000/api/dcc/list", {
          method: 'GET',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          cache: 'no-store'
        });

        if (!response.ok) {
          if (response.status === 401) {
            console.error('Unauthorized - redirecting to login');
            router.push('/');
            return;
          }
          if (response.status === 403) {
            console.error('Access denied - Officer role required');
            return;
          }
          throw new Error('Failed to fetch data');
        }

        const dccList = await response.json();
        
        let transformedData: any[] = [];

        const baseMapper = (dcc: any) => ({
          id: dcc.id,
          certificateId: dcc.administrative_data.sertifikat,
          date: dcc.created_at,
          object: dcc.objects_description?.[0]?.jenis?.en || dcc.objects_description?.[0]?.jenis?.id,
          submitter: dcc.submitter,
          lab: dcc.responsible_persons?.kepala?.peran.match(/SNSU\s+(.*)/)?.[1] || null,
          status: dcc.status,
          effective_status: dcc.effective_status,
          rejection_note: dcc.rejection_note || null,
          rejector_role: dcc.rejector_role || null,
          has_been_rejected: dcc.has_been_rejected || 0,
          original_dcc_id: dcc.original_dcc_id || null,
          revision_number: dcc.revision_number || 0,
          revised_badge: dcc.revised_badge || 0,
          has_been_revised: dcc.has_been_revised || false,
          a_revision_is_approved_by_head: dcc.a_revision_is_approved_by_head || false,
          a_revision_is_approved_by_director: dcc.a_revision_is_approved_by_director || false,
        });

        if (isHead()) {
          transformedData = dccList
            .filter((dcc: any) => !dcc.original_dcc_id)  // Only show originals in the rows, not revisions
            .map(baseMapper);
        } else if (isDirector()) {
          transformedData = dccList
            .filter(
              (dcc: any) =>
                !dcc.original_dcc_id || dcc.status === "approved_head" || dcc.rejector_role === "director"
            )
            .map(baseMapper);
        }

        setData(transformedData);
      } catch (error) {
        console.error('Error fetching DCC data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-gray-600">
          <Spinner className="h-12 w-12 mx-auto stroke-[1]" />
          <p className="mt-4">{t("loading")}...</p>
        </div>
      </div>
    );
  }

  return <DashboardClient data={data} />
}