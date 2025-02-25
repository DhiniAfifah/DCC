"use client";

import { useState } from "react";
import Stepper from "@/components/ui/stepper";
import AdministrativeForm from "@/components/administrative-form";
import { Button } from "@/components/ui/button";

export default function CreateDCC() {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = [
    "Administrative Data",
    "Measurement Results",
    "Comments",
    "Preview",
  ];

  // Simpan data form di state
  const [formData, setFormData] = useState({
    software_name: "",
    software_version: "",
    issuer: "",
    country: "",
    used_languages: [""],
    mandatory_languages: [""],
    certificate_number: "",
    order_number: "",
    measurement_start: "",
    measurement_end: "",
    calibration_place: "",
    approval_date: "",
    objects: [
      {
        jenis: null,
        merek: null,
        tipe: null,
        issuer: null,
        seri: null,
        idLain: null,
      },
    ],
    responsible_person: {
      name: "",
      nip: "",
      role: "",
      signature: "",
      timestamp: "",
    },
    owner_identity: {
      name: "",
      street_name: "",
      street_number: "",
      city: "",
      province: "",
      postal_code: "",
      country: "",
    },
    statements: [""],
  });

  const [downloadLink, setDownloadLink] = useState<string | null>(null);

  const updateFormData = (data: any) => {
    setFormData((prev) => ({
      ...prev,
      ...data,
      used_languages: data.used_languages
        ? data.used_languages.map((lang: string) => ({ value: lang }))
        : prev.used_languages,
      mandatory_languages: data.mandatory_languages
        ? data.mandatory_languages.map((lang: string) => ({ value: lang }))
        : prev.mandatory_languages,
      certificate_number: data.certificate_number?.toString() || "",
      order_number: data.order_number?.toString() || "",
      measurement_start: data.measurement_start
        ? new Date(data.measurement_start).toISOString().split("T")[0]
        : prev.measurement_start,
      measurement_end: data.measurement_end
        ? new Date(data.measurement_end).toISOString().split("T")[0]
        : prev.measurement_end,
      approval_date: data.approval_date
        ? new Date(data.approval_date).toISOString().split("T")[0]
        : prev.approval_date,
      statements: Array.isArray(data.statements)
        ? data.statements.map((stmt: string) =>
            typeof stmt === "string" ? stmt.trim() : ""
          )
        : [],
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

      let errorMessage = "Unknown error occurred.";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      alert(`Failed to create DCC. Error: ${errorMessage}`);
    }
  };

  return (
    <div className="container mx-auto py-8 max-h-screen overflow-y-auto z-10">
      <Stepper currentStep={currentStep} steps={steps} />

      <div className="mt-12">
        {currentStep === 0 && (
          <AdministrativeForm updateFormData={updateFormData} />
        )}
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
