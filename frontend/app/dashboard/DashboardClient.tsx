// app/dashboard/DashboardClient.tsx
"use client"

import { columns, Certificate } from "./columns"
import { DataTable } from "./data-table"
import DirectorProtectedRoute from "@/components/DirectorProtectedRoute"
import { useLanguage } from "@/context/LanguageContext"

export default function DashboardClient({ data }: { data: Certificate[] }) {
  const { t } = useLanguage();

  return (
    <DirectorProtectedRoute>
      <div className="container mx-auto pt-20 px-10 pb-10">
        <div className="mb-6 mt-6">
          <h1 className="text-3xl font-bold text-gray-900">{t("dashboard")}</h1>
          <p className="text-gray-600 mt-2">{t("welcome_dashboard")}</p>
        </div>
        <DataTable columns={columns} data={data} />
      </div>
    </DirectorProtectedRoute>
  )
}