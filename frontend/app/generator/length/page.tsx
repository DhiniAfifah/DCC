import DccFormWrapper from "@/components/DccFormWrapper";
import { Ruler } from "lucide-react";
import { blankTemplate } from "../blankTemplate";

export default function CreateDCC() {
  return (
    <DccFormWrapper
      formType="length"
      icon={<Ruler className="text-sky-500 w-7 h-7" />}
      title="panjang"
      titleColor="text-sky-900"
      bgColor="bg-sky-50"
      borderColor="border-sky-200"
      blankTemplate={blankTemplate}
      templates={{}}
      showTemplateSelect={false}
    />
  );
}