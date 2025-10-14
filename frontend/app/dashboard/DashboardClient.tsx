"use client"

import { columns, Certificate } from "./columns"
import { DataTable } from "./data-table"
import DirectorProtectedRoute from "@/components/DirectorProtectedRoute"
import { useLanguage } from "@/context/LanguageContext"

export default function DashboardClient({ data }: { data: Certificate[] }) {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen">
      <div className="fixed inset-0 -z-20 bg-gradient-to-b from-white to-indigo-100"></div>

      <DirectorProtectedRoute>
        <div className="container mx-auto pt-20 px-10 pb-10">
          <div className="mb-6 mt-6">
            <h1 className="text-3xl font-bold text-gray-900">{t("dashboard")}</h1>
            <p className="text-gray-600 mt-2">{t("welcome_dashboard")}</p>
          </div>
          <DataTable columns={columns} data={data} />
        </div>
      </DirectorProtectedRoute>
    </div>
  )
}