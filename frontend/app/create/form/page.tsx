"use client";

import { useState } from "react";
import { useForm, FormProvider, useFieldArray } from "react-hook-form"; // Import useFieldArray untuk menangani array
import Stepper from "@/components/ui/stepper";
import AdministrativeForm from "@/components/administrative-form";
import MeasurementForm from "@/components/measurement-form";
import Statements from "@/components/statements"; // Import Statements component
import { Button } from "@/components/ui/button";

export default function CreateDCC() {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = [
    "Data Administrasi",
    "Hasil Kalibrasi",
    "Statements",
    "Preview",
  ];

  const formMethods = useForm({
    defaultValues: {
      software: "",
      version: "",
      core_issuer: "",
      country_code: "",
      used_languages: [],
      mandatory_languages: [],
      sertifikat: "",
      order: "",
      tgl_mulai: "",
      tgl_akhir: "",
      tempat: "",
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
      responsible_persons: [
        {
          nama_resp: "",
          nip: "",
          peran: "",
          main_signer: "",
          signature: "",
          timestamp: "",
        },
      ],
      owner: {
        nama_cust: "",
        jalan_cust: "",
        no_jalan_cust: "",
        kota_cust: "",
        state_cust: "",
        pos_cust: "",
        negara_cust: "",
      },
      statements: [{ statement: "" }],
      methods: [{ name: "", norm: "", description: "" }],
      equipments: [{ name: "", manufacturer_model: "", serial_number: "" }],
      conditions: [
        {
          condition_type: "",
          description: "",
          center_point: 0,
          center_unit: "",
          range_value: 0,
          range_unit: "",
        },
      ],
    },
  });

  const { handleSubmit, setValue, getValues, control } = formMethods;

  const {
    fields: methodsFields,
    append: appendMethod,
    remove: removeMethod,
  } = useFieldArray({
    control,
    name: "methods",
  });

  const {
    fields: equipmentFields,
    append: appendEquipment,
    remove: removeEquipment,
  } = useFieldArray({
    control,
    name: "equipments",
  });

  const {
    fields: conditionsFields,
    append: appendCondition,
    remove: removeCondition,
  } = useFieldArray({
    control,
    name: "conditions",
  });

  const {
    fields: statementsFields,
    append: appendStatement,
    remove: removeStatement,
  } = useFieldArray({
    control,
    name: "statements",
  });

  const [downloadLink, setDownloadLink] = useState<string | null>(null);

  const updateFormData = (data: any) => {
    setValue("methods", data.methods || getValues("methods"));
    setValue("equipments", data.equipments || getValues("equipments"));
    setValue("conditions", data.conditions || getValues("conditions"));
    setValue("statements", data.statements || getValues("statements"));
  };

  const handleFormSubmit = async (data: any) => {
    try {
      const response = await fetch("http://127.0.0.1:8000/create-dcc/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! Status: ${response.status}, Message: ${errorText}`
        );
      }

      const responseData = await response.json();
      if (responseData.download_link) {
        setDownloadLink(responseData.download_link);
        alert("DCC Created! Klik tombol di bawah untuk mengunduh.");
      } else {
        alert("DCC Created, tetapi link unduhan tidak ditemukan.");
      }
    } catch (error: unknown) {
      let errorMessage = "Unknown error occurred.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      alert(`Failed to create DCC. Error: ${errorMessage}`);
    }
  };

  return (
    <FormProvider {...formMethods}>
      <div className="container mx-auto py-8 pt-20">
        <Stepper currentStep={currentStep} steps={steps} />

        <div className="mt-12 space-y-10">
          {currentStep === 0 && (
            <AdministrativeForm updateFormData={updateFormData} />
          )}
          {currentStep === 1 && (
            <MeasurementForm updateFormData={updateFormData} />
          )}
          {currentStep === 2 && <Statements form={formMethods} />}
        </div>

        <div className="flex justify-between max-w-4xl mx-auto px-4 mt-8">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(currentStep - 1)}
            disabled={currentStep === 0}
          >
            Previous
          </Button>

          {currentStep === steps.length - 1 ? (
            <Button onClick={handleSubmit(handleFormSubmit)}>Submit</Button>
          ) : (
            <Button onClick={() => setCurrentStep(currentStep + 1)}>
              Next
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
    </FormProvider>
  );
}
