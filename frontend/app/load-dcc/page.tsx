"use client";

import Importer from "@/components/importer";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";

export default function LoadDCC() {
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    xml: null,
  })

  const handleSubmit = async () => {

  }

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = ""; // Show warning when user attempts to leave
    };

    if (formData) {
      window.addEventListener("beforeunload", handleBeforeUnload);
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [formData]); // Depend on formData to track changes
  
  return (
    <div className="container mx-auto py-8 pt-20">
      <div className="fixed inset-0 -z-20 bg-gradient-to-b from-gray-50 to-violet-200"></div>

      <div className="mt-12 space-y-10">
        <Importer formData={formData} />
        
      </div>
      <div className="flex justify-end max-w-4xl mx-auto px-4 mt-8">
        <Button onClick={handleSubmit} variant="green">{t("submit")}</Button>
      </div>
    </div>
  )
}