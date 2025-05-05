"use client";

import { useEffect, useState } from "react";
import Stepper from "@/components/ui/stepper";
import AdministrativeForm from "@/components/administrative-form";
import MeasurementForm from "@/components/measurement-form";
import Statements from "@/components/statements";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLanguage } from '@/context/LanguageContext';

export default function CreateDCC() {
  const { t } = useLanguage();
  
  const [currentStep, setCurrentStep] = useState(0);
  const steps = [
    t('administrasi'),
    t('hasil'),
    t('statements'),
    t('preview'),
  ];

  const [fileName, setFileName] = useState<string>("");

  // Simpan data form di state
  const [formData, setFormData] = useState({
    software: "",
    version: "",
    core_issuer: "calibrationLaboratory",
    country_code: "",
    used_languages: [{ value: "" }],
    mandatory_languages: [{ value: "" }],
    sertifikat: "",
    order: "",
    tgl_mulai: "",
    tgl_akhir: "",
    tempat: "",
    tempat_pdf: "",
    tgl_pengesahan: "",
    objects: [
      {
        jenis: "",
        merek: "",
        tipe: "",
        item_issuer: "",
        seri_item: "",
        id_lain: "",
      },
    ],
    responsible_persons: {
      pelaksana: [
        {
          nama_resp: "",
          nip: "",
          peran: "Pelaksana Kalibrasi",
          main_signer: "false",
          signature: "false",
          timestamp: "false",
        },
      ],
      penyelia: [
        {
          nama_resp: "",
          nip: "",
          peran: "Penyelia Kalibrasi",
          main_signer: "false",
          signature: "false",
          timestamp: "false",
        },
      ],
      kepala: {
        nama_resp: "",
        nip: "",
        peran: "",
        main_signer: "false",
        signature: "false",
        timestamp: "false",
      },
      direktur: {
        nama_resp: "",
        nip: "",
        peran: "",
        main_signer: "true",
        signature: "true",
        timestamp: "true",
      },
    },
    owner: {
      nama_cust: "",
      jalan_cust: "",
      no_jalan_cust: "",
      kota_cust: "",
      state_cust: "",
      pos_cust: "",
      negara_cust: "",
    },
    methods: [
      {
        method_name: "",
        method_desc: "",
        norm: "",
        has_formula: false,
        formula: {
          latex: "",
          mathml: "",
        },
        has_image: false,
        image: {
          gambar: null,
          caption: "",
        },
      },
    ],
    equipments: [
      {
        nama_alat: "",
        manuf_model: "",
        seri_measuring: "",
      },
    ],
    conditions: [
      {
        jenis_kondisi: "",
        desc: "",
        tengah: "",
        rentang: "",
        rentang_unit: "",
        tengah_unit: "",
      },
    ],
    sheet_name: "",
    results: [
      {
        parameters: "",
        columns: [
          {
            kolom: "",
            real_list: "1",
          },
        ],
        uncertainty: {
          factor: "2",
          probability: "0.95",
          distribution: "",
          real_list: "1",
        },
      },
    ],
    statements: [
      {
        values: "",
        has_formula: false,
        formula: {
          latex: "",
          mathml: "",
        },
        has_image: false,
        image: {
          gambar: null,
          caption: "",
        },
      },
    ],
  });

  // useEffect(() => {
  //   const handleBeforeUnload = (event: BeforeUnloadEvent) => {
  //     event.preventDefault();
  //     event.returnValue = ""; // Show warning when user attempts to leave
  //   };

  //   if (formData) {
  //     window.addEventListener("beforeunload", handleBeforeUnload);
  //   }

  //   return () => {
  //     window.removeEventListener("beforeunload", handleBeforeUnload);
  //   };
  // }, [formData]); // Depend on formData to track changes

  const [downloadLink, setDownloadLink] = useState<string | null>(null);

  const formatDate = (date: Date | string | null): string | null => {
    if (!date) return null;

    const localDate = new Date(date);
    localDate.setMinutes(
      localDate.getMinutes() - localDate.getTimezoneOffset()
    ); // Adjust for timezone

    return localDate.toISOString().split("T")[0];
  };

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
        ? formatDate(new Date(data.tgl_mulai))
        : prev.tgl_mulai,
      tgl_akhir: data.tgl_akhir
        ? formatDate(new Date(data.tgl_akhir))
        : prev.tgl_akhir,
      tgl_pengesahan: data.tgl_pengesahan
        ? formatDate(new Date(data.tgl_pengesahan))
        : prev.tgl_pengesahan,
      statements: Array.isArray(data.statements)
        ? data.statements
        : prev.statements,
      responsible_persons: data.responsible_persons
        ? {
            pelaksana:
              data.responsible_persons.pelaksana ??
              prev.responsible_persons.pelaksana,
            penyelia:
              data.responsible_persons.penyelia ??
              prev.responsible_persons.penyelia,
            kepala:
              data.responsible_persons.kepala ??
              prev.responsible_persons.kepala,
            direktur:
              data.responsible_persons.direktur ??
              prev.responsible_persons.direktur,
          }
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
    // Ensure formula is empty when has_formula is false
    const modifiedStatements = formData.statements.map((statement) => ({
      ...statement,
      formula: statement.has_formula ? statement.formula : "", // Clear formula if checkbox is false
    }));

    const modifiedMethods = formData.methods.map((method) => ({
      ...method,
      formula: method.has_formula ? method.formula : "", // Clear formula if checkbox is false
    }));

    const modifiedFormData = {
      ...formData,
      statements: modifiedStatements,
      methods: modifiedMethods,
      excel: fileName, // Ensure excel contains only the filename
    };

    console.log("Data yang dikirim ke backend:", modifiedFormData);

    try {
      const response = await fetch("http://127.0.0.1:8000/create-dcc/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(modifiedFormData),
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

      if (error instanceof Error) {
        alert(`Failed to create DCC. Error: ${error.message}`);
      } else {
        alert("An unknown error occurred.");
      }
    }
  };

  return (
    <div className="container mx-auto py-8 pt-20">
      <Stepper currentStep={currentStep} steps={steps} onStepClick={setCurrentStep} />

      <div className="mt-12 space-y-10">
        {currentStep === 0 && (
          <AdministrativeForm
            formData={formData}
            updateFormData={updateFormData}
          />
        )}
        {currentStep === 1 && (
          <MeasurementForm
            formData={formData}
            updateFormData={updateFormData}
            setFileName={setFileName}
          />
        )}
        {currentStep === 2 && (
          <Statements formData={formData} updateFormData={updateFormData} />
        )}
      </div>

      <div className="flex justify-between max-w-4xl mx-auto px-4 mt-8">
        <Button
          variant="blue"
          onClick={prevStep}
          disabled={currentStep === 0}
        >
          <ArrowLeft />
        </Button>

        {currentStep === steps.length - 1 ? (
          <Button onClick={handleSubmit} variant="green">Submit</Button>
        ) : (
          <Button onClick={nextStep} variant="blue">
            <ArrowRight />
          </Button>
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
