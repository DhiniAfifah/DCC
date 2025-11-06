"use client"

import { useEffect, useState } from "react"
import DashboardClient from "./DashboardClient"
import { Certificate } from "./columns"
import { useRouter } from "next/navigation"
import { Spinner } from "@/components/ui/spinner"
import { useLanguage } from "@/context/LanguageContext"

export default function Dashboard() {
  const [data, setData] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { t } = useLanguage()

  useEffect(() => {
    async function fetchData() {
      try {
        // Get token from cookies (client-side)
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('access_token='))
          ?.split('=')[1];

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
        
        const transformedData = dccList.map((dcc: any) => ({
          id: dcc.id,
          certificateId: dcc.administrative_data.sertifikat,
          date: dcc.created_at,
          object: dcc.objects_description?.[0]?.jenis?.en || dcc.objects_description?.[0]?.jenis?.id,
          submitter: dcc.submitter,
          lab: dcc.responsible_persons?.kepala?.peran.match(/SNSU\s+(.*)/)?.[1],
          status: dcc.status,
        }));

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