"use client";

import { useEffect, useState } from "react";
import Stepper from "@/components/ui/stepper";
import AdministrativeForm from "@/components/administrative-form";
import MeasurementForm from "@/components/measurement-form";
import Statements from "@/components/statements";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

// Helper type guard untuk cek apakah value adalah File
const isFile = (value: any): value is File => {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof value.name === "string" &&
    typeof value.size === "number"
  );
};

export default function CreateDCC() {
  const { t } = useLanguage();

  const [currentStep, setCurrentStep] = useState(0);
  const steps = [t("administrasi"), t("hasil"), t("statements"), t("preview")];

  const [fileName, setFileName] = useState<string>("");

  // Simpan data form di state
  const [formData, setFormData] = useState({
    software: "",
    version: "",
    Measurement_TimeLine: {
      tgl_mulai: "",
      tgl_akhir: "",
      tgl_pengesahan: "",
    },
    administrative_data: {
      core_issuer: "calibrationLaboratory",
      country_code: "",
      used_languages: [{ value: "" }],
      mandatory_languages: [{ value: "" }],
      sertifikat: "",
      order: "",
      tempat: "",
      tempat_pdf: "",
    },
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
          gambar: "",
          caption: "",
          fileName: "",
          mimeType: "",
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
    excel: "",
    results: [
      {
        parameters: [""],
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
          gambar: "",
          caption: "",
          fileName: "",
          mimeType: "",
        },
      },
    ],
  });

  const formatDate = (date: Date | string | null): string | null => {
    if (!date) return null;
    const localDate = new Date(date);
    localDate.setMinutes(
      localDate.getMinutes() - localDate.getTimezoneOffset()
    );
    return localDate.toISOString().split("T")[0];
  };

  const updateFormData = (data: any) => {
    setFormData((prev) => ({
      ...prev,
      ...data,
      administrative_data: {
        ...prev.administrative_data,
        ...(data.administrative_data ?? {}),
      },
      Measurement_TimeLine: {
        ...prev.Measurement_TimeLine,
        ...(data.Measurement_TimeLine
          ? {
              tgl_mulai: data.Measurement_TimeLine.tgl_mulai
                ? formatDate(new Date(data.Measurement_TimeLine.tgl_mulai))
                : prev.Measurement_TimeLine.tgl_mulai,
              tgl_akhir: data.Measurement_TimeLine.tgl_akhir
                ? formatDate(new Date(data.Measurement_TimeLine.tgl_akhir))
                : prev.Measurement_TimeLine.tgl_akhir,
              tgl_pengesahan: data.Measurement_TimeLine.tgl_pengesahan
                ? formatDate(new Date(data.Measurement_TimeLine.tgl_pengesahan))
                : prev.Measurement_TimeLine.tgl_pengesahan,
            }
          : prev.Measurement_TimeLine),
      },
      responsible_persons: {
        ...prev.responsible_persons,
        ...(data.responsible_persons ?? {}),
      },
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
      statements: Array.isArray(data.statements)
        ? data.statements
        : prev.statements,
    }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
  };
  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    // Validasi results
    const isValid = formData.results.every((result) => {
      return (
        Array.isArray(result.parameters) &&
        result.parameters.every((param) => typeof param === "string")
      );
    });

    if (!isValid) {
      alert("Parameters harus berupa array yang berisi string.");
      return;
    }

    // Create FormData object for multipart/form-data submission
    const submitFormData = new FormData();

    const modifiedFormData = {
      ...formData,
      administrative_data: {
        ...formData.administrative_data,
        used_languages: formData.administrative_data.used_languages.map(
          (lang) => lang.value
        ),
        mandatory_languages:
          formData.administrative_data.mandatory_languages.map(
            (lang) => lang.value
          ),
      },
      methods: formData.methods.map((method, index) => {
        if (
          method.has_image &&
          method.image?.gambar &&
          isFile(method.image.gambar)
        ) {
          return {
            ...method,
            image: {
              ...method.image,
              gambar: method.image.gambar.name,
              mimeType: method.image.mimeType, // Ensure mimeType is sent
              fileName: method.image.gambar,
            },
          };
        }
        return method;
      }),
      statements: formData.statements.map((stmt, index) => {
        if (stmt.has_image && stmt.image?.gambar && isFile(stmt.image.gambar)) {
          return {
            ...stmt,
            image: {
              ...stmt.image,
              gambar: stmt.image.gambar.name,
              mimeType: stmt.image.mimeType, // Ensure mimeType is sent
              fileName: stmt.image.gambar,
            },
          };
        }
        return stmt;
      }),
      results: formData.results.map((result) => ({
        parameters: result.parameters,
        columns: result.columns.map((col) => ({
          kolom: Array.isArray(col.kolom) ? col.kolom[0] || "" : col.kolom,
          real_list: Number(col.real_list) || 1,
        })),
        uncertainty: {
          factor: result.uncertainty.factor,
          probability: result.uncertainty.probability,
          distribution: result.uncertainty.distribution || "",
          real_list: result.uncertainty.real_list,
        },
      })),
      excel: fileName,
    };

    // Prepare FormData for file uploads
    formData.methods.forEach((method, index) => {
      if (
        method.has_image &&
        method.image?.gambar &&
        isFile(method.image.gambar)
      ) {
        const file = method.image.gambar;
        submitFormData.append(`methods[${index}].image.gambar`, file);
        submitFormData.append(
          `methods[${index}].image.mimeType`,
          method.image.mimeType
        ); // Append mimeType
        submitFormData.append(
          `methods[${index}].image.fileName`,
          method.image.fileName
        ); // Append fileName
      }
    });

    formData.statements.forEach((stmt, index) => {
      if (stmt.has_image && stmt.image?.gambar && isFile(stmt.image.gambar)) {
        const file = stmt.image.gambar;
        submitFormData.append(`statements[${index}].image.gambar`, file);
        submitFormData.append(
          `statements[${index}].image.mimeType`,
          stmt.image.mimeType
        ); // Append mimeType
        submitFormData.append(
          `statements[${index}].image.fileName`,
          stmt.image.fileName
        ); // Append fileName
      }
    });

    submitFormData.append("data", JSON.stringify(modifiedFormData));

    console.log("Data yang dikirim ke backend:", modifiedFormData);

    try {
      const response = await fetch("http://127.0.0.1:8000/create-dcc/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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

  const [downloadLink, setDownloadLink] = useState<string | null>(null);

  return (
    <div className="container mx-auto py-8 pt-20">
      <Stepper
        currentStep={currentStep}
        steps={steps}
        onStepClick={setCurrentStep}
      />

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
            setFileName={setFileName} // Jangan lupa props ini ya
          />
        )}
        {currentStep === 2 && (
          <Statements formData={formData} updateFormData={updateFormData} />
        )}
      </div>

      <div className="flex justify-between max-w-4xl mx-auto px-4 mt-8">
        <Button variant="blue" onClick={prevStep} disabled={currentStep === 0}>
          <ArrowLeft />
        </Button>

        {currentStep === steps.length - 1 ? (
          <Button onClick={handleSubmit} variant="green">
            Submit
          </Button>
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
