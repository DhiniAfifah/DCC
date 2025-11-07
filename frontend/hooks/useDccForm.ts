import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";

interface UseDccFormProps {
  formType: "acoustics-vibration" | "biology" | "chemistry" | "electrical" | "ionizing-radiation" | "length" | "mass" | "photometry-radiometry" | "temperature" | "time-frequency";
  blankTemplate: any;
  templates?: Record<string, any>;
}

interface FormState {
  form_type?: string;
  software: string;
  version: string;
  Measurement_TimeLine: {
    tgl_mulai: string | null;
    tgl_akhir: string | null;
    tgl_pengesahan: string | null;
  };
  administrative_data: any;
  objects: any[];
  responsible_persons: any;
  owner: any;
  methods: any[];
  equipments: any[];
  conditions: any[];
  results: any[];
  statements: any[];
  comment: any;
  sheet_names: string[];
  sheet_name: string;
  excel: string;
}

export function useDccForm({ formType, blankTemplate, templates = {} }: UseDccFormProps) {
  const { t } = useLanguage();
  const [templateChangeKey, setTemplateChangeKey] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [fileName, setFileName] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [formData, setFormData] = useState<FormState>({
    ...blankTemplate,
    form_type: formType
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedImages, setUploadedImages] = useState<{
    methods: { [key: string]: File }[];
    statements: { [key: string]: File }[];
  }>({
    methods: [],
    statements: [],
  });
  const [uploadedCommentFiles, setUploadedCommentFiles] = useState<File[]>([]);
  const [previewFiles, setPreviewFiles] = useState<{pdf: string | null, xml: string | null}>({
    pdf: null,
    xml: null
  });
  const [isProcessingPreview, setIsProcessingPreview] = useState<boolean>(false);
  const [isProcessingSubmission, setIsProcessingSubmission] = useState<boolean>(false);
  const [progressMessage, setProgressMessage] = useState<string>("");
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [isLoadingDraft, setIsLoadingDraft] = useState(false);
  const [draftName, setDraftName] = useState<string>("");

  // Template change effect
  useEffect(() => {
    const loadTemplate = async () => {
      if (selectedTemplate && templates[selectedTemplate]) {
        const template = templates[selectedTemplate];
        
        let loadedTemplate;
        // Handle image loading if needed
        if (typeof template === 'function') {
          loadedTemplate = await template();
          setFormData(loadedTemplate);
        } else {
          // If template has a 'data' property, use that, otherwise use template directly
          loadedTemplate = template.data || template;
        }

        // Ensure the template has all required structure
        const completeTemplate = {
          ...blankTemplate,
          ...loadedTemplate,
          Measurement_TimeLine: {
            ...blankTemplate.Measurement_TimeLine,
            ...(loadedTemplate.Measurement_TimeLine || {}),
          },
          administrative_data: {
            ...blankTemplate.administrative_data,
            ...(loadedTemplate.administrative_data || {}),
          },
          responsible_persons: {
            ...blankTemplate.responsible_persons,
            ...(loadedTemplate.responsible_persons || {}),
          },
          owner: {
            ...blankTemplate.owner,
            ...(loadedTemplate.owner || {}),
          },
          comment: {
            ...blankTemplate.comment,
            ...(loadedTemplate.comment || {}),
          },
        };
        
        setFormData(completeTemplate);
      } else {
        setFormData(blankTemplate);
      }
      setTemplateChangeKey((prev: number) => prev + 1);
    };
    
    loadTemplate();
  }, [selectedTemplate, blankTemplate, templates]);

  // Prevent data loss
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    if (formData) {
      window.addEventListener("beforeunload", handleBeforeUnload);
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [formData]);

  const formatDate = (date: Date | string | null): string | null => {
    if (!date) return null;
    const localDate = new Date(date);
    localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
    return localDate.toISOString().split("T")[0];
  };

  const updateFormData = useCallback((data: Partial<FormState>) => {
    setFormData((prev: FormState) => {
      if (JSON.stringify(prev) === JSON.stringify({ ...prev, ...data })) {
        return prev;
      }
      
      return {
        ...prev,
        form_type: prev.form_type || formType, // Preserve or set form_type
        ...data,
        administrative_data: {
          ...prev.administrative_data,
          ...(data.administrative_data ?? {}),
        },
        Measurement_TimeLine: {
          ...prev.Measurement_TimeLine,
          ...(data.Measurement_TimeLine
            ? {
                tgl_mulai: data.Measurement_TimeLine.tgl_mulai
                  ? formatDate(new Date(data.Measurement_TimeLine.tgl_mulai))
                  : prev.Measurement_TimeLine.tgl_mulai,
                tgl_akhir: data.Measurement_TimeLine.tgl_akhir
                  ? formatDate(new Date(data.Measurement_TimeLine.tgl_akhir))
                  : prev.Measurement_TimeLine.tgl_akhir,
                tgl_pengesahan: data.Measurement_TimeLine.tgl_pengesahan
                  ? formatDate(new Date(data.Measurement_TimeLine.tgl_pengesahan))
                  : prev.Measurement_TimeLine.tgl_pengesahan,
              }
            : prev.Measurement_TimeLine),
        },
        responsible_persons: {
          ...prev.responsible_persons,
          ...(data.responsible_persons ?? {}),
        },
        objects: Array.isArray(data.objects)
          ? data.objects.map((obj: any) => ({
              jenis: obj.jenis || {},
              merek: obj.merek || "",
              tipe: obj.tipe || "",
              item_issuer: obj.item_issuer || "",
              seri_item: obj.seri_item || "",
              id_lain: obj.id_lain || {},
            }))
          : prev.objects,
        statements: Array.isArray(data.statements)
          ? data.statements
          : prev.statements,
      };
    });
  }, [formType]);

  // Load draft from URL
  const loadDraft = async (draftId: string) => {
    try {
      setIsLoadingDraft(true);
      const token = localStorage.getItem("access_token");
      
      const response = await fetch(`http://127.0.0.1:8000/api/drafts/${draftId}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load draft");
      }

      const draft = await response.json();
      
      const loadedData: FormState = {
        ...draft.data,
        objects: Array.isArray(draft.data.objects) ? draft.data.objects : [],
        methods: Array.isArray(draft.data.methods) ? draft.data.methods : [],
        equipments: Array.isArray(draft.data.equipments) ? draft.data.equipments : [],
        conditions: Array.isArray(draft.data.conditions) ? draft.data.conditions : [],
        results: Array.isArray(draft.data.results) ? draft.data.results : [],
        statements: Array.isArray(draft.data.statements) ? draft.data.statements : [],
        sheet_names: Array.isArray(draft.data.sheet_names) ? draft.data.sheet_names : [],
        administrative_data: draft.data.administrative_data || blankTemplate.administrative_data,
        Measurement_TimeLine: draft.data.Measurement_TimeLine || blankTemplate.Measurement_TimeLine,
        responsible_persons: draft.data.responsible_persons || blankTemplate.responsible_persons,
        owner: draft.data.owner || blankTemplate.owner,
        comment: draft.data.comment || blankTemplate.comment,
      };
      
      setFormData(loadedData);
      setTemplateChangeKey((prev: number) => prev + 1);
      
      toast.success(t("loaded"));
      setIsLoadingDraft(false);
    } catch (error) {
      console.error("Error loading draft:", error);
      toast.error(t("failed_to_load"));
      setIsLoadingDraft(false);
    }
  };

  // Check for draft parameter in URL
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const draftId = searchParams.get('draft');
    
    if (draftId) {
      setTimeout(() => loadDraft(draftId), 100);
    }
  }, [blankTemplate, t]);

  const saveDraft = async (name: string, data: FormState) => {
    try {
      const token = localStorage.getItem("access_token");
      
      if (!token) {
        toast.error(t("authentication_required"));
        return;
      }
      
      const response = await fetch("http://127.0.0.1:8000/api/drafts/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name,
          data: data,
          form_type: formType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Unknown error" }));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      toast.success(t("draft_saved"));
      return result;
    } catch (error) {
      console.error("Error saving draft:", error);
      toast.error(t("failed_to_save_draft") + ": " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };

  return {
    // State
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
    isLoadingDraft,
    draftName,
    templateChangeKey,
    
    // Setters
    setFormData,
    setCurrentStep,
    setFileName,
    setSelectedTemplate,
    setUploadedFile,
    setUploadedImages,
    setUploadedCommentFiles,
    setPreviewFiles,
    setIsProcessingPreview,
    setIsProcessingSubmission,
    setProgressMessage,
    setProgressPercent,
    setDraftName,
    
    // Functions
    updateFormData,
    saveDraft,
    loadDraft,
  };
}