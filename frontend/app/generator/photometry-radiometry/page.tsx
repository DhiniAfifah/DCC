import DccFormWrapper from "@/components/DccFormWrapper";
import { Lightbulb } from "lucide-react";
import { blankTemplate } from "../blankTemplate";

export default function CreateDCC() {
  return (
    <DccFormWrapper
      formType="photometry-radiometry"
      icon={<Lightbulb className="text-purple-600 w-7 h-7" />}
      title="fotometri_radiometri"
      titleColor="text-purple-900"
      bgColor="bg-purple-50"
      borderColor="border-purple-200"
      blankTemplate={blankTemplate}
      templates={{}}
      showTemplateSelect={false}
    />
  );
}