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

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="container mx-auto py-8 max-h-screen overflow-y-auto z-10">
      {/* Menambahkan z-index agar scrollbar terlihat */}
      <Stepper currentStep={currentStep} steps={steps} />

      <div className="mt-12">
        {currentStep === 0 && <AdministrativeForm />}
        {/* Form step lainnya */}
      </div>

      <div className="flex justify-between max-w-4xl mx-auto px-4 mt-8">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 0}
        >
          Previous
        </Button>
        <Button onClick={nextStep} disabled={currentStep === steps.length - 1}>
          Next
        </Button>
      </div>
    </div>
  );
}
