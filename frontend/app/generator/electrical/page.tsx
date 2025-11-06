import DccFormWrapper from "@/components/DccFormWrapper";
import Administrative from "@/components/administrative-electrical";
import Measurement from "@/components/measurement-electrical";
import { Zap } from "lucide-react";
import { blankTemplate } from "../blankTemplate";
import { multimeterTemplate, calibratorTemplate } from "./templates";

export default function CreateDCC() {
  return (
    <DccFormWrapper
      formType="electrical"
      icon={<Zap className="text-orange-400 w-7 h-7" />}
      title="listrik"
      titleColor="text-orange-900"
      bgColor="bg-orange-50"
      borderColor="border-orange-200"
      blankTemplate={blankTemplate}
      templates={{
        multimeter: {
          name: "multimeter",
          data: multimeterTemplate
        },
        calibrator: {
          name: "calibrator",
          data: calibratorTemplate
        }
      }}
      AdministrativeComponent={Administrative}
      MeasurementComponent={Measurement}
    />
  );
}