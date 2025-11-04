"use client"

import { columns, Certificate } from "./columns"
import { DataTable } from "./data-table"
import OfficerProtectedRoute from "@/components/OfficerProtectedRoute"
import { useLanguage } from "@/context/LanguageContext"
import { isDirector, isHead } from "@/utils/auth"
import { useMemo, useEffect } from "react"
import { UserCog, UserCheck } from "lucide-react"

export default function DashboardClient({ data }: { data: Certificate[] }) {
  const { t } = useLanguage();

  useEffect(() => {
    document.title = "Dashboard | DiCCA";
  }, []);

  // Filter data based on user role on the client side
  const filteredData = useMemo(() => {
    if (isHead()) {
      return data.filter((cert) =>
        ["pending_head", "approved_head", "rejected_head", "approved_director", "rejected_director"].includes(cert.status)
      );
    } else if (isDirector()) {
      return data.filter((cert) =>
        ["approved_head", "approved_director", "rejected_director"].includes(cert.status)
      );
    }
    return data;
  }, [data]);

  return (
    <div className="min-h-screen">
      <div className="fixed inset-0 -z-20 bg-gradient-to-b from-white to-indigo-100"></div>

      <OfficerProtectedRoute>
        <div className="container mx-auto pt-20 px-10 pb-10">
          <div className="mb-6 mt-6">
            <h1 className="text-3xl font-bold text-gray-900">
              {isHead() ? 
                <div className="flex items-center gap-2">
                  <UserCog /> {t("head_dashboard")}
                </div>
              : isDirector() ? 
                <div className="flex items-center gap-2">
                  <UserCheck /> {t("director_dashboard")}
                </div>
              : t("dashboard")}
            </h1>
            <p className="text-gray-600 mt-2">
              {isHead() ? t("welcome_dashboard_head") 
              : isDirector() ? t("welcome_dashboard_director") 
              : t("dashboard")}
            </p>
          </div>
          <DataTable columns={columns} data={filteredData} />
        </div>
      </OfficerProtectedRoute>
    </div>
  )
}