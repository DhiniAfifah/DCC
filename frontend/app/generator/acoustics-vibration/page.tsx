import DccFormWrapper from "@/components/DccFormWrapper";
import { AudioWaveform } from "lucide-react";
import { blankTemplate } from "../blankTemplate";

export default function CreateDCC() {
  return (
    <DccFormWrapper
      formType="acoustics-vibration"
      icon={<AudioWaveform className="text-lime-600 w-7 h-7" />}
      title="akustik_vibrasi"
      titleColor="text-lime-900"
      bgColor="bg-lime-50"
      borderColor="border-lime-200"
      blankTemplate={blankTemplate}
      templates={{}}
      showTemplateSelect={false}
    />
  );
}