import { columns, Certificate } from "./columns"
import { DataTable } from "./data-table"
import ProtectedRoute from "@/components/ProtectedRoute";

async function getData(): Promise<Certificate[]> {
  // Fetch data from your API here.
  return [
    {
        id: "S.24-2304",
        date: "2024-12-19",
        object: "Standard Resistor",
        submitter: "Nibras Fitrah Yayiende, M.T.",
        status: "pending",
    },
    {
        id: "S.24-1349",
        date: "2024-07-26",
        object: "Digital Multimeter",
        submitter: "Agah Faisal, M.Sc",
        status: "pending",
    },
  ]
}

async function Dashboard() {
  const data = await getData()

  return (
    <div className="container mx-auto py-20">
      <DataTable columns={columns} data={data} />
    </div>
  )
}

export default function ProtectedDashboardPage() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}