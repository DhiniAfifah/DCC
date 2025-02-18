import { Check } from "lucide-react";

interface StepperProps {
  currentStep: number;
  steps: string[];
}

export default function Stepper({ currentStep, steps }: StepperProps) {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-center">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center">
            <div className="relative">
              <div
                className={`w-10 h-10 flex items-center justify-center rounded-full border-2 transition-colors duration-200
                  ${
                    currentStep > index
                      ? "bg-green-600 border-green-600"
                      : currentStep === index
                      ? "border-blue-600 text-blue-600"
                      : "border-gray-300 text-gray-300"
                  }`}
              >
                {currentStep > index ? (
                  <Check className="w-6 h-6 text-white" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-max text-sm">
                <span
                  className={
                    currentStep >= index ? "text-blue-600" : "text-gray-400"
                  }
                >
                  {step}
                </span>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-20 h-0.5 transition-colors duration-200 ${
                  currentStep > index ? "bg-green-600" : "bg-gray-300"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
