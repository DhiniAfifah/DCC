"use client";

import { useState } from "react";
import Stepper from "@/components/ui/stepper";
import AdministrativeForm from "@/components/administrative-form";
import MeasurementForm from "@/components/measurement-form";
import Statements from "@/components/statements";
import Comment from "@/components/comment";
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
  const steps = [
    t("administrasi"),
    t("hasil"),
    t("statements"),
    t("comment"),
    t("preview"),
  ];

  const [fileName, setFileName] = useState<string>("");

  // Simpan data form di state
  const [formData, setFormData] = useState({
    software: "A",
    version: "A",
    Measurement_TimeLine: {
      tgl_mulai: "2025-06-15",
      tgl_akhir: "2025-06-15",
      tgl_pengesahan: "2025-06-15",
    },
    administrative_data: {
      core_issuer: "calibrationLaboratory",
      country_code: "ID",
      used_languages: [{ value: "id" }, { value: "en" }],
      mandatory_languages: [{ value: "id" }],
      sertifikat: "A",
      order: "A",
      tempat: "A",
      tempat_pdf: "A",
    },
    objects: [
      {
        jenis: {id: 'A', en: 'A'},
        merek: "A",
        tipe: "A",
        item_issuer: "A",
        seri_item: "A",
        id_lain: {id: 'A', en: 'A'},
      },
    ],
    responsible_persons: {
      pelaksana: [
        {
          nama_resp: "A",
          nip: "A",
          peran: "Pelaksana Kalibrasi",
          main_signer: "0",
          signature: "0",
          timestamp: "0",
        },
      ],
      penyelia: [
        {
          nama_resp: "A",
          nip: "A",
          peran: "Penyelia Kalibrasi",
          main_signer: "0",
          signature: "0",
          timestamp: "0",
        },
      ],
      kepala: {
        nama_resp: "A",
        nip: "A",
        peran: "Kepala Laboratorium SNSU Biologi",
        main_signer: "0",
        signature: "0",
        timestamp: "0",
      },
      direktur: {
        nama_resp: "A",
        nip: "A",
        peran: "Direktur SNSU Termoelektrik dan Kimia",
        main_signer: "1",
        signature: "1",
        timestamp: "1",
      },
    },
    owner: {
      nama_cust: "A",
      jalan_cust: "A",
      no_jalan_cust: "A",
      kota_cust: "A",
      state_cust: "A",
      pos_cust: "A",
      negara_cust: "ID",
    },
    methods: [
      {
        method_name: {id: 'A', en: 'A'},
        method_desc: {id: 'A', en: 'A'},
        norm: "A",
        refType: "basic_methodMeasurementUncertainty",
        has_formula: true,
        formula: {
          latex: "A",
          mathml: "A",
        },
        has_image: true,
        image: {
          //gambar: "",
          caption: "A",
          fileName: "",
          mimeType: "",
          base64: "",
        },
      },
    ],
    equipments: [
      {
        nama_alat: {id: 'A', en: 'A'},
        manuf_model: {id: 'A', en: 'A'},
        model: {id: 'A', en: 'A'},
        seri_measuring: "A",
        refType: "basic_measurementStandard",
      },
    ],
    conditions: [
      {
        jenis_kondisi: "suhu",
        desc: {id: 'A', en: 'A'},
        tengah: "A",
        rentang: "A",
        rentang_unit: {
          prefix: "\\centi", //
          prefix_pdf: "c",
          unit: "\\metre", //xml only
          unit_pdf: "m", //
          eksponen: "1",
          eksponen_pdf: "1",
        },
        tengah_unit: {
          prefix: "\\centi",
          prefix_pdf: "c",
          unit: "\\metre",
          unit_pdf: "m",
          eksponen: "1",
          eksponen_pdf: "1",
        },
      },
    ],
    sheet_name: "Lap",
    excel: "",
    results: [
      {
        parameters: {id: 'Resistansi DC', en: 'DC Resistance'},
        columns: [
          {
            kolom: {id: 'Arus Uji Nominal', en: 'Nominal Test Current'},
            refType: "basic_nominalValue",
            real_list: "1",
          },
        ],
        uncertainty: {
          factor: "2",
          probability: "0.95",
          distribution: "normal",
          real_list: "1",
        },
      },
    ],
    statements: [
      {
        values: {id: 'A', en: 'A'},
        refType: "basic_conformity",
        has_formula: true,
        formula: {
          latex: "A",
          mathml: "A",
        },
        has_image: true,
        image: {
          caption: "A",
          fileName: "",
          mimeType: "",
          base64: "",
        },
      },
    ],
    comment: {
      title: "A",
      desc: {id: 'A', en: 'A'},
      has_file: true,
      files: [
        {
          file: "",
          fileName: "",
          mimeType: "",
          base64: "",
        },
      ],
    },
  });

  // Kasih warning saat user mencoba meninggalkan halaman (agar isi formulir tidak hilang)
  // useEffect(() => {
  //   const handleBeforeUnload = (event: BeforeUnloadEvent) => {
  //     event.preventDefault();
  //     event.returnValue = "";
  //   };

  //   if (formData) {
  //     window.addEventListener("beforeunload", handleBeforeUnload);
  //   }

  //   return () => {
  //     window.removeEventListener("beforeunload", handleBeforeUnload);
  //   };
  // }, [formData]);

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
    // // Validasi results
    // const isValid = formData.results.every((result) => {
    //   return (
    //     Array.isArray(result.parameters) &&
    //     result.parameters.every((param) => typeof param === "string")
    //   );
    // });

    // if (!isValid) {
    //   alert("Parameters harus berupa array yang berisi string.");
    //   return;
    // }

    // Create FormData object for multipart/form-data submission
    const submitFormData = new FormData();

    const modifiedFormData = {
      ...formData,
      administrative_data: {
        ...formData.administrative_data,
        used_languages:
          formData.administrative_data.used_languages
            ?.filter((lang) => lang.value && lang.value.trim() !== "")
            .map((lang) => lang.value) || [],
        mandatory_languages:
          formData.administrative_data.mandatory_languages.map(
            (lang) => lang.value
          ),
      },
      methods: formData.methods.map((method, index) => {
        if (
          method.has_image &&
          method.image?.fileName &&
          isFile(method.image.fileName)
        ) {
          return {
            ...method,
            image: {
              ...method.image,
              base64: method.image.fileName.name,
              mimeType: method.image.mimeType,
              fileName: method.image.fileName,
            },
          };
        }
        return method;
      }),
      statements: formData.statements.map((stmt, index) => {
        if (
          stmt.has_image &&
          stmt.image?.fileName &&
          isFile(stmt.image.fileName)
        ) {
          return {
            ...stmt,
            image: {
              ...stmt.image,
              base64: stmt.image.fileName.name,
              mimeType: stmt.image.mimeType,
              fileName: stmt.image.fileName,
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
          refType: col.refType || "",
        })),
        uncertainty: result.uncertainty
          ? {
              factor: result.uncertainty.factor || "0",
              probability: result.uncertainty.probability || "0",
              distribution: result.uncertainty.distribution || "",
            }
          : { factor: "0", probability: "0", distribution: "" },
      })),
      excel: fileName,
    };

    // Prepare FormData for file uploads
    formData.methods.forEach((method, index) => {
      if (
        method.has_image &&
        method.image?.fileName &&
        isFile(method.image.fileName)
      ) {
        const file = method.image.fileName;
        submitFormData.append(`methods[${index}].image.gambar`, file);
        submitFormData.append(
          `methods[${index}].image.mimeType`,
          method.image.mimeType
        );
        submitFormData.append(
          `methods[${index}].image.fileName`,
          method.image.fileName
        );
      }
    });

    formData.statements.forEach((stmt, index) => {
      if (
        stmt.has_image &&
        stmt.image?.fileName &&
        isFile(stmt.image.fileName)
      ) {
        const file = stmt.image.fileName;
        submitFormData.append(`statements[${index}].image.gambar`, file);
        submitFormData.append(
          `statements[${index}].image.mimeType`,
          stmt.image.mimeType
        );
        submitFormData.append(
          `statements[${index}].image.fileName`,
          stmt.image.fileName
        );
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
      <div className="fixed inset-0 -z-20 bg-gradient-to-b from-white to-green-100"></div>

      <Stepper
        currentStep={currentStep}
        steps={steps}
        onStepClick={setCurrentStep}
      />

      {currentStep !== 4 && (
        <p className="mt-12 text-center text-red-600 text-sm">
          * {t("asterisk")}
        </p>
      )}
      <div className="space-y-10">
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
        {currentStep === 3 && (
          <Comment formData={formData} updateFormData={updateFormData} />
        )}
      </div>

      <div className="flex justify-between max-w-4xl mx-auto px-4 mt-8">
        <Button variant="blue" onClick={prevStep} disabled={currentStep === 0}>
          <ArrowLeft />
        </Button>

        {currentStep === steps.length - 1 ? (
          <Button onClick={handleSubmit} variant="green">
            {t("submit")}
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
