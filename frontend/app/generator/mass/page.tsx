import DccFormWrapper from "@/components/DccFormWrapper";
import { Weight } from "lucide-react";
import { blankTemplate } from "../blankTemplate";

export default function CreateDCC() {
  return (
    <DccFormWrapper
      formType="mass"
      icon={<Weight className="text-gray-600 w-7 h-7" />}
      title="massa"
      titleColor="text-gray-800"
      bgColor="bg-gray-200"
      borderColor="border-gray-300"
      blankTemplate={blankTemplate}
      templates={{}}
      showTemplateSelect={false}
    />
  );
}