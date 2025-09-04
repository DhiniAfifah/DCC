import { Check } from "lucide-react";

interface StepperProps {
  currentStep: number;
  steps: string[];
  onStepClick: (stepIndex: number) => void;
}

export default function Stepper({ currentStep, steps, onStepClick }: StepperProps) {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-center">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center">
            <div className="relative focus:outline-none">
              <div
                className={`w-10 h-10 flex items-center justify-center rounded-full border-2 transition-colors duration-200
                  ${
                    currentStep > index
                      ? "bg-green-600 border-green-600"
                      : currentStep === index
                      ? "border-sky-500 text-sky-500"
                      : "border-gray-500 text-gray-500"
                  }`}
              >
                {currentStep > index ? (
                  <Check className="w-6 h-6 text-white" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-22 sm:w-max text-xs sm:text-sm text-center sm:whitespace-nowrap">
                <span
                  className={
                    currentStep >= index ? "text-sky-500" : "text-gray-500"
                  }
                >
                  {step}
                </span>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-8 md:w-32 h-0.5 transition-colors duration-200 ${
                  currentStep > index ? "bg-green-600" : "bg-gray-500"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}