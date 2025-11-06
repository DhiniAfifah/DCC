import DccFormWrapper from "@/components/DccFormWrapper";
import { FlaskConical } from "lucide-react";
import { blankTemplate } from "../blankTemplate";

export default function CreateDCC() {
  return (
    <DccFormWrapper
      formType="chemistry"
      icon={<FlaskConical className="text-green-600 w-7 h-7" />}
      title="kimia"
      titleColor="text-green-900"
      bgColor="bg-green-100"
      borderColor="border-green-300"
      blankTemplate={blankTemplate}
      templates={{}}
      showTemplateSelect={false}
    />
  );
}