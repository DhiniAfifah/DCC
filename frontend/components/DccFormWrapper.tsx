"use client";

import { useEffect, useState } from "react";
import Stepper from "@/components/ui/stepper";
import Administrative from "@/components/administrative";
import Measurement from "@/components/measurement";
import Statements from "@/components/statements";
import Comment from "@/components/comment";
import Preview from "@/components/preview";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Send, Save, AlertCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { useDccForm } from "@/hooks/useDccForm";
import { getValidationErrors } from "@/utils/dccValidation";
import { handleDccSubmission, generatePreview } from "@/utils/dccSubmission";

interface DccFormWrapperProps {
  formType: "acoustics-vibration" | "biology" | "chemistry" | "electrical" | "ionizing-radiation" | "length" | "mass" | "photometry-radiometry" | "temperature" | "time-frequency";
  icon: React.ReactNode;
  title: string;
  titleColor: string;
  bgColor: string;
  borderColor: string;
  blankTemplate: any;
  templates?: Record<string, any>;
  AdministrativeComponent?: React.ComponentType<any>;
  MeasurementComponent?: React.ComponentType<any>;
  showTemplateSelect?: boolean;
}

export default function DccFormWrapper({
  formType,
  icon,
  title,
  titleColor,
  bgColor,
  borderColor,
  blankTemplate,
  templates = {},
  AdministrativeComponent = Administrative,
  MeasurementComponent = Measurement,
  showTemplateSelect = true,
}: DccFormWrapperProps) {
  const { t, language } = useLanguage();
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    formData,
    currentStep,
    fileName,
    selectedTemplate,
    uploadedFile,
    uploadedImages,
    uploadedCommentFiles,
    previewFiles,
    isProcessingPreview,
    isProcessingSubmission,
    progressMessage,
    progressPercent,
    draftName,
    templateChangeKey,
    setCurrentStep,
    setFileName,
    setSelectedTemplate,
    setUploadedFile,
    setUploadedImages,
    setUploadedCommentFiles,
    setPreviewFiles,
    setIsProcessingPreview,
    setProgressPercent,
    setProgressMessage,
    setIsProcessingSubmission,
    setDraftName,
    updateFormData,
    saveDraft,
  } = useDccForm({ formType, blankTemplate, templates });

  useEffect(() => {
    document.title = `${t(title)} | Generator | DiCCA`;
  }, [title]);

  const steps = [
    t("administrasi"),
    t("hasil"),
    t("statements"),
    t("comment"),
    t("preview"),
  ];

  // Generate preview when on preview step
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (currentStep === 4) {
        generatePreview(formData, fileName, setIsProcessingPreview, setPreviewFiles);
      }
    }, 1000);

    return () => clearTimeout(debounceTimer);
  }, [formData, currentStep, fileName]);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      const errors = getValidationErrors(formData, currentStep, t);
      
      if (errors.length > 0) {
        toast.error("Please fill in all required fields:", {
          description: (
            <div>
              <ul className="list-disc pl-5">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
              {t("strip")}
            </div>
          )
        });
        return;
      }
      
      const newStep = currentStep + 1;
      setCurrentStep(newStep);

      if (newStep === 4) {
        generatePreview(formData, fileName, setIsProcessingPreview, setPreviewFiles);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = () => {
    handleDccSubmission(
      formData,
      fileName,
      language,
      setProgressPercent,
      setProgressMessage,
      setIsProcessingSubmission,
      setPdfBlobUrl,
      setIsSubmitted,
      t
    );
  };

  return (
    <div className="container mx-auto py-8 pt-20">
      <div className="fixed inset-0 -z-20 bg-gradient-to-b from-white to-green-100"></div>

      <div className="text-center mt-6 mb-3">
        <div className={`inline-flex items-center gap-3 px-6 py-3 ${bgColor} border ${borderColor} rounded-3xl shadow-sm`}>
          {icon}
          <h1 className={`text-2xl font-semibold ${titleColor} tracking-wide`}>
            {t(title)}
          </h1>
        </div>
      </div>

      <Stepper
        currentStep={currentStep}
        steps={steps}
        onStepClick={setCurrentStep}
      />

      <div className="flex justify-center pt-6 mb-6 px-10">
        {currentStep !== 4 && showTemplateSelect && Object.keys(templates).length > 0 && (
          <div className="pt-4 mb-1">
            <Select onValueChange={setSelectedTemplate} value={selectedTemplate}>
              <SelectTrigger className="w-[400px] bg-white">
                <SelectValue placeholder={t("template")} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>{t("template")}</SelectLabel>
                  <SelectItem value="blank">{t("blank")}</SelectItem>
                  {Object.keys(templates).map(key => (
                    <SelectItem key={key} value={key}>
                      {t(templates[key].name || key)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        )}
        {currentStep === 4 && (
          <div className="pt-4 mb-1">
            <Alert variant="destructive" className="bg-white w-fit">
              <AlertCircle className="w-4 h-4" />
              <AlertTitle>{t("close_excel")}</AlertTitle>
            </Alert>
          </div>
        )}
      </div>
      
      <div className="space-y-10">
        {currentStep === 0 && (
          <AdministrativeComponent
            formData={formData}
            updateFormData={updateFormData}
            templateChangeKey={templateChangeKey}
          />
        )}
        {currentStep === 1 && (
          <MeasurementComponent
            formData={formData}
            updateFormData={updateFormData}
            setFileName={setFileName}
            uploadedFile={uploadedFile}
            setUploadedFile={setUploadedFile}
            uploadedImages={uploadedImages.methods}
            setUploadedImages={(images: any) => setUploadedImages(prev => ({ ...prev, methods: images }))}
          />
        )}
        {currentStep === 2 && (
          <Statements 
            formData={formData} 
            updateFormData={updateFormData}
            uploadedImages={uploadedImages.statements}
            setUploadedImages={(images: any) => setUploadedImages(prev => ({ ...prev, statements: images }))}
          />
        )}
        {currentStep === 3 && (
          <Comment 
            formData={formData} 
            updateFormData={updateFormData}
            uploadedFiles={uploadedCommentFiles}
            setUploadedFiles={setUploadedCommentFiles}
          />
        )}
        {currentStep === 4 && (
          <Preview 
            previewFiles={previewFiles}
            isLoading={isProcessingPreview}
            onRefresh={() => generatePreview(formData, fileName, setIsProcessingPreview, setPreviewFiles)}
          />
        )}
      </div>

      {isProcessingSubmission && (
        <div id="progress-bar" className="max-w-4xl mx-auto px-4 mt-8">
          <div className="p-6 bg-sky-50 rounded-lg border border-sky-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sky-800 font-semibold text-lg">{progressMessage}</p>
              <span className="text-sky-600 text-sm">{progressPercent}%</span>
            </div>

            <Progress value={progressPercent} />
            
            <div className="flex items-center justify-between text-xs text-sky-600">
              <div>
                {progressPercent > 0 && progressPercent < 100 && (
                  <div className="mt-3 flex items-center text-sm">
                    <Spinner className="" />
                  </div>
                )}
              </div>
              
              <span className="mt-2">{t("please_wait")}</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between max-w-4xl mx-auto px-4 mt-8">
        <Button variant="blue" onClick={prevStep} disabled={currentStep === 0 || isProcessingSubmission}>
          <ArrowLeft />
        </Button>

        <div className="flex justify-center gap-4 max-w-4xl mx-auto px-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="amber"
                disabled={isProcessingSubmission}
              >
                <Save />
                {t("save_draft")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{t("save_draft")}</DialogTitle>
                <DialogDescription>{t("draft_desc")}</DialogDescription>
              </DialogHeader>
              <div className="flex items-center gap-2">
                <div className="grid flex-1 gap-2">
                  <Label htmlFor="draft_name">{t("draft_name")}</Label>
                  <Input
                    id="draft_name"
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="secondary">{t("cancel")}</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button
                    onClick={() => {
                      if (draftName.trim()) {
                        saveDraft(draftName, formData);
                        setDraftName("");
                      }
                    }}
                    variant="green"
                  >
                    {t("save")}
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {currentStep === steps.length - 1 ? (
          <div className="flex flex-col items-center gap-4">
            <Button 
              onClick={handleSubmit} 
              variant="green"
              disabled={isProcessingSubmission}
            >
              {isProcessingSubmission ? t("processing") : (
                <>
                  <Send />
                  {t("submit")}
                </>
              )}
            </Button>
          </div>
        ) : (
          <Button 
            onClick={nextStep} 
            variant="blue" 
            disabled={isProcessingSubmission}
          >
            <ArrowRight />
          </Button>
        )}
      </div>
    </div>
  );
}