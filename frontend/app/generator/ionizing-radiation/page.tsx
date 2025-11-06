import DccFormWrapper from "@/components/DccFormWrapper";
import { Radiation } from "lucide-react";
import { blankTemplate } from "../blankTemplate";

export default function CreateDCC() {
  return (
    <DccFormWrapper
      formType="ionizing-radiation"
      icon={<Radiation className="text-yellow-500 w-7 h-7" />}
      title="radiasi"
      titleColor="text-yellow-800"
      bgColor="bg-yellow-50"
      borderColor="border-yellow-200"
      blankTemplate={blankTemplate}
      templates={{}}
      showTemplateSelect={false}
    />
  );
}