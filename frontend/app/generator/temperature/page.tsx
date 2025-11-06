import DccFormWrapper from "@/components/DccFormWrapper";
import Administrative from "@/components/administrative-temperature";
import Measurement from "@/components/measurement-temperature";
import { Thermometer } from "lucide-react";
import { pt25Template, pt100Template, blankTemplate } from "./templates";

export default function CreateDCC() {
  return (
    <DccFormWrapper
      formType="temperature"
      icon={<Thermometer className="text-red-600 w-7 h-7" />}
      title="suhu"
      titleColor="text-red-900"
      bgColor="bg-red-50"
      borderColor="border-red-200"
      blankTemplate={blankTemplate}
      templates={{
        pt25: {
          name: "pt25",
          data: pt25Template
        },
        pt100: {
          name: "pt100",
          data: pt100Template
        }
      }}
      AdministrativeComponent={Administrative}
      MeasurementComponent={Measurement}
    />
  );
}