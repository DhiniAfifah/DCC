import DashboardClient from "./DashboardClient"
import { Certificate } from "./columns"

async function getData(): Promise<Certificate[]> {
  try {
    const response = await fetch("http://127.0.0.1:8000/api/dcc/list", {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });

    if (!response.ok) {
      if (response.status === 403) {
        console.error('Access denied - Director role required');
        return [];
      }
      throw new Error('Failed to fetch data');
    }

    const dccList = await response.json();

    return dccList.map((dcc: any) => ({
      id: dcc.id,
      certificateId: dcc.administrative_data.sertifikat,
      date: dcc.Measurement_TimeLine?.tgl_pengesahan || new Date().toISOString(),
      object: dcc.objects_description?.[0]?.jenis?.en || dcc.objects_description?.[0]?.jenis?.id || '-',
      submitter: dcc.responsible_persons?.pelaksana?.[0]?.nama_resp || '-',
      status: dcc.status || 'pending' as const,
    }));
  } catch (error) {
    console.error('Error fetching DCC data:', error);
    return [];
  }
}

export default async function Dashboard() {
  const data = await getData();

  return <DashboardClient data={data} />
}