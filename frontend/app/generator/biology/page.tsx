import DccFormWrapper from "@/components/DccFormWrapper";
import { Microscope } from "lucide-react";
import { blankTemplate } from "../blankTemplate";

export default function CreateDCC() {
  return (
    <DccFormWrapper
      formType="biology"
      icon={<Microscope className="text-pink-500 w-7 h-7" />}
      title="biologi"
      titleColor="text-pink-900"
      bgColor="bg-pink-50"
      borderColor="border-pink-200"
      blankTemplate={blankTemplate}
      templates={{}}
      showTemplateSelect={false}
    />
  );
}