import { columns, Certificate } from "./columns"
import { DataTable } from "./data-table"

async function getData(): Promise<Certificate[]> {
  // Fetch data from your API here.
  return [
    {
        id: "S.24-0127",
        date: "2024-03-5",
        object: "Current Shunt",
        submitter: "Hayati Amalia, M.T.",
        status: "pending",
    },
    {
        id: "S.24-1349",
        date: "2024-07-26",
        object: "Digital Multimeter",
        submitter: "Agah Faisal, M.Sc",
        status: "approved",
    },
    {
        id: "S.24-2304",
        date: "2024-12-19",
        object: "Standard Resistor",
        submitter: "Nibras Fitrah Yayiende, M.T.",
        status: "rejected",
    },
  ]
}

export default async function Dashboard() {
  const data = await getData()

  return (
    <div className="container mx-auto pt-20 px-10 pb-10">
      <DataTable columns={columns} data={data} />
    </div>
  )
}