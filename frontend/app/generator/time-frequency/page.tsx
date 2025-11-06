import DccFormWrapper from "@/components/DccFormWrapper";
import { Timer } from "lucide-react";
import { blankTemplate } from "../blankTemplate";

export default function CreateDCC() {
  return (
    <DccFormWrapper
      formType="time-frequency"
      icon={<Timer className="text-indigo-700 w-7 h-7" />}
      title="waktu"
      titleColor="text-indigo-900"
      bgColor="bg-indigo-50"
      borderColor="border-indigo-200"
      blankTemplate={blankTemplate}
      templates={{}}
      showTemplateSelect={false}
    />
  );
}
        // <div className="inline-flex items-center gap-3 px-6 py-3 bg-indigo-50 border border-indigo-200 rounded-3xl shadow-sm">
        //   <Timer className="text-indigo-700 w-7 h-7" />
        //   <h1 className="text-2xl font-semibold text-indigo-900 tracking-wide">
        //     {t("waktu")}