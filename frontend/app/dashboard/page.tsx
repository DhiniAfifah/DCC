import { columns, Certificate } from "./columns"
import { DataTable } from "./data-table"

async function getData(): Promise<Certificate[]> {
  // return [
  //   {
  //       id: "S.24-0127",
  //       date: "2024-03-5",
  //       object: "Current Shunt",
  //       submitter: "Hayati Amalia, M.T.",
  //       status: "pending",
  //   },
  //   {
  //       id: "S.24-1349",
  //       date: "2024-07-26",
  //       object: "Digital Multimeter",
  //       submitter: "Agah Faisal, M.Sc",
  //       status: "approved",
  //   },
  //   {
  //       id: "S.24-2304",
  //       date: "2024-12-19",
  //       object: "Standard Resistor",
  //       submitter: "Nibras Fitrah Yayiende, M.T.",
  //       status: "rejected",
  //   },
  // ]

  try {
    // Replace with your actual API endpoint
    const response = await fetch("http://127.0.0.1:8000/api/dcc/list", {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add cache: 'no-store' if you want fresh data on every request
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }

    const dccList = await response.json();
    
    // Transform the database data to match your Certificate interface
    return dccList.map((dcc: any) => ({
      id: dcc.id,
      certificateId: dcc.administrative_data.sertifikat,
      date: dcc.Measurement_TimeLine?.tgl_pengesahan || new Date().toISOString(),
      object: dcc.objects_description?.[0]?.jenis?.en || dcc.objects_description?.[0]?.jenis?.id || '-',
      submitter: dcc.responsible_persons?.pelaksana?.[0]?.nama_resp || '-',
      status: dcc.status || 'pending' as const, // Assuming you have a status field
    }));
  } catch (error) {
    console.error('Error fetching DCC data:', error);
    
    // Fallback to empty array or show error state
    return [];
  }
}

export default async function Dashboard() {
  const data = await getData()

  return (
    <div className="container mx-auto pt-20 px-10 pb-10">
      <DataTable columns={columns} data={data} />
    </div>
  )
}