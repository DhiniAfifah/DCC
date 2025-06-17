"use client";

import Importer from "@/components/importer";
import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";

export default function LoadDCC() {
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    xml: null,
  });

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    if (formData) {
      window.addEventListener("beforeunload", handleBeforeUnload);
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [formData]);

  const handleFormSubmit = (data: any) => {
    console.log("Form Data Submitted:", data);
    setFormData(data);
  };

  return (
    <div className="container mx-auto py-8 pt-20">
      <div className="fixed inset-0 -z-20 bg-gradient-to-b from-white to-sky-200"></div>

      <div className="mt-12 space-y-10">
        <Importer formData={formData} onSubmit={handleFormSubmit} />
      </div>
    </div>
  );
}
