"use client";

import { useEffect, useState } from "react";
import Stepper from "@/components/ui/stepper";
import AdministrativeForm from "@/components/administrative-form";
import MeasurementForm from "@/components/measurement-form";
import Statements from "@/components/statements";
import { Button } from "@/components/ui/button";

export default function CreateDCC() {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = [
    "Data Administrasi",
    "Hasil Kalibrasi",
    "Statements",
    "Preview",
  ];

  // Simpan data form di state
  const [formData, setFormData] = useState({
    software: "",
    version: "",
    core_issuer: "",
    country_code: "",
    used_languages: [{ value: "" }],
    mandatory_languages: [{ value: "" }],
    sertifikat: "",
    order: "",
    tgl_mulai: "",
    tgl_akhir: "",
    tempat: "",
    tgl_pengesahan: "",
    objects: [{
      jenis: "",
      merek: "",
      tipe: "",
      item_issuer: "",
      seri_item: "",
      id_lain: "",
    }],
    responsible_persons: [{
      nama_resp: "",
      nip: "",
      peran: "",
      main_signer: "",
      signature: "",
      timestamp: "",
    }],
    owner: {
      nama_cust: "",
      jalan_cust: "",
      no_jalan_cust: "",
      kota_cust: "",
      state_cust: "",
      pos_cust: "",
      negara_cust: "",
    },
    methods: [{ 
      method_name: "", 
      method_desc: "", 
      norm: "" 
    }],
    equipments: [{ 
      nama_alat: "", 
      manuf_model: "", 
      seri_measuring: "" 
    }],
    conditions: [{ 
      kondisi: "", 
      kondisi_desc: "", 
      tengah_value: "", 
      tengah_unit: "", 
      rentang_value: "", 
      rentang_unit: "" 
    }],
    sheet_name: "",
    results: [{ 
      parameter: "", 
      columns: [{ 
        kolom: "", 
        real_list: [{ 
          value: "", 
          unit: ""
        }] 
      }] 
    }],
    statements: [{ value: "" }],
  });

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

  const [downloadLink, setDownloadLink] = useState<string | null>(null);

  const updateFormData = (data: any) => {
    setFormData((prev) => ({
      ...prev,
      ...data,
      used_languages: data.used_languages
        ? data.used_languages
        : prev.used_languages,
      mandatory_languages: data.mandatory_languages
        ? data.mandatory_languages
        : prev.mandatory_languages,
      sertifikat: data.sertifikat?.toString() || "",
      order: data.order?.toString() || "",
      tgl_mulai: data.tgl_mulai
        ? new Date(data.tgl_mulai).toISOString().split("T")[0]
        : prev.tgl_mulai,
      tgl_akhir: data.tgl_akhir
        ? new Date(data.tgl_akhir).toISOString().split("T")[0]
        : prev.tgl_akhir,
      tgl_pengesahan: data.tgl_pengesahan
        ? new Date(data.tgl_pengesahan).toISOString().split("T")[0]
        : prev.tgl_pengesahan,
      statements: Array.isArray(data.statements)
        ? data.statements.map((stmt: string) =>
            typeof stmt === "string" ? stmt.trim() : ""
          )
        : prev.statements,
      responsible_persons: Array.isArray(data.responsible_persons)
        ? data.responsible_persons.map((resp: any) => ({
            nama_resp: resp.nama_resp || "",
            nip: resp.nip || "",
            peran: resp.peran || "",
            main_signer: resp.main_signer || "",
            signature: resp.signature || "",
            timestamp: resp.timestamp || "",
          }))
        : prev.responsible_persons,
      objects: Array.isArray(data.objects)
        ? data.objects.map((obj: any) => ({
            jenis: obj.jenis || "",
            merek: obj.merek || "",
            tipe: obj.tipe || "",
            item_issuer: obj.item_issuer || "",
            seri_item: obj.seri_item || "",
            id_lain: obj.id_lain || "",
          }))
        : prev.objects,
    }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Fungsi untuk kembali ke langkah sebelumnya
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    console.log("Data yang dikirim ke backend:", formData);

    try {
      const response = await fetch("http://127.0.0.1:8000/create-dcc/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! Status: ${response.status}, Message: ${errorText}`
        );
      }

      const data = await response.json();
      console.log("Response from backend:", data);

      if (data.download_link) {
        setDownloadLink(data.download_link);
        alert(`DCC Created! Click the button below to download.`);
      } else {
        alert("DCC Created, but download link is missing.");
      }
    } catch (error: unknown) {
      console.error("Error submitting form:", error);

      // Cek apakah error adalah instance dari Error
      if (error instanceof Error) {
        alert(`Failed to create DCC. Error: ${error.message}`);
      } else {
        alert("An unknown error occurred.");
      }
    }
  };

  return (
    <div className="container mx-auto py-8 pt-20">
      <Stepper currentStep={currentStep} steps={steps} />

      <div className="mt-12 space-y-10">
        {currentStep === 0 && (
          <AdministrativeForm formData={formData} updateFormData={updateFormData} />
        )}
        {currentStep === 1 && <MeasurementForm formData={formData} updateFormData={updateFormData} />}
        {currentStep === 2 && <Statements formData={formData} updateFormData={updateFormData} />}
      </div>

      <div className="flex justify-between max-w-4xl mx-auto px-4 mt-8">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 0}
        >
          Previous
        </Button>

        {currentStep === steps.length - 1 ? (
          <Button onClick={handleSubmit}>Submit</Button>
        ) : (
          <Button onClick={nextStep}>Next</Button>
        )}
      </div>

      {downloadLink && (
        <div className="text-center mt-6">
          <p className="text-green-500 font-semibold">
            DCC Created Successfully!
          </p>
          <a href={downloadLink} target="_blank" rel="noopener noreferrer">
            <Button variant="default" className="mt-2">
              Download DCC
            </Button>
          </a>
        </div>
      )}
    </div>
  );
}
