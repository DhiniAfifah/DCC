import { toast } from "sonner";
import { getAccessToken } from "@/utils/auth"

const isFile = (value: any): value is File => {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof value.name === "string" &&
    typeof value.size === "number"
  );
};

export async function handleDccSubmission(
  formData: any,
  fileName: string,
  language: string,
  setProgressPercent: (val: number) => void,
  setProgressMessage: (val: string) => void,
  setIsProcessingSubmission: (val: boolean) => void,
  setPdfBlobUrl: (url: string) => void,
  setIsSubmitted: (val: boolean) => void,
  t: (key: string) => string
) {
  setIsProcessingSubmission(true);
  setProgressMessage(t("preparing"));
  setProgressPercent(0);

  const token = getAccessToken();

  if (!token) {
    toast.error("Authentication required", {
      description: "Please log in to submit DCC",
      duration: 5000
    });
    setIsProcessingSubmission(false);
    return;
  }

  const modifiedFormData = prepareFormData(formData, fileName);

  try {
    const response = await fetch("http://127.0.0.1:8000/create-dcc-streaming/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept-Language": language === 'id' ? 'id-ID,id;q=0.9' : 'en-US,en;q=0.9',
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(sanitizeData(modifiedFormData)),
    });

    if (!response.ok) {
      if (response.status === 401) {
        toast.error("Authentication failed", {
          description: "Please log in again",
        });
        window.location.href = '/';
        return;
      }

      const errorText = await response.text();
      throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
    }

    await processStreamResponse(response, setProgressPercent, setProgressMessage, setPdfBlobUrl, setIsSubmitted, setIsProcessingSubmission, t);

  } catch (
    error: unknown) {
    console.error("Error submitting form:", error);
    setProgressMessage(
      `Error: ${error instanceof Error ? error.message : "An unknown error occurred"}`
    );
    setProgressPercent(0);
    setIsProcessingSubmission(false);
    
    toast.error("Failed to create DCC", {
      description: error instanceof Error ? error.message : "An unknown error occurred",
      duration: 5000
    });
  }
}

function prepareFormData(formData: any, fileName: string) {
  return {
    ...formData,
    administrative_data: {
      ...formData.administrative_data,
      used_languages:
        formData.administrative_data.used_languages
          ?.filter((lang: any) => lang.value && lang.value.trim() !== "")
          .map((lang: any) => lang.value) || [],
      mandatory_languages:
        formData.administrative_data.mandatory_languages.map(
          (lang: any) => lang.value
        ),
    },
    methods: formData.methods.map((method: any) => {
      if (method.has_image && Array.isArray(method.image)) {
        return {
          ...method,
          image: method.image.map((img: any) =>
            img?.fileName && isFile(img.fileName)
              ? {
                  ...img,
                  base64: img.fileName.name,
                  mimeType: img.mimeType,
                  fileName: img.fileName,
                }
              : img
          ),
        };
      }
      return method;
    }),
    statements: formData.statements.map((stmt: any) => {
      if (stmt.has_image && Array.isArray(stmt.image)) {
        return {
          ...stmt,
          image: stmt.image.map((img: any) =>
            img?.fileName && isFile(img.fileName)
              ? {
                  ...img,
                  base64: img.fileName.name,
                  mimeType: img.mimeType,
                  fileName: img.fileName,
                }
              : img
          ),
        };
      }
      return stmt;
    }),
    results: formData.results.map((result: any) => ({
      parameters: result.parameters,
      columns: result.columns.map((col: any) => {
        const columnData: any = {
          kolom: Array.isArray(col.kolom) ? col.kolom[0] || "" : col.kolom,
          real_list: Number(col.real_list) || 1,
          refType: col.refType || "",
        };
        
        // Only include column_unit for temperature forms
        if (formData.form_type === 'temperature' && col.column_unit) {
          columnData.column_unit = {
            prefix: col.column_unit.prefix || "",
            unit: col.column_unit.unit || "",
            eksponen: col.column_unit.eksponen || "",
          };
        }
        
        return columnData;
      }),
      uncertainty: result.uncertainty
        ? {
            factor: result.uncertainty.factor || "0",
            probability: result.uncertainty.probability || "0",
            distribution: result.uncertainty.distribution || "",
            
            // Onclude real_list and uncertainty_unit for temperature forms
            ...(formData.form_type === 'temperature' && result.uncertainty.uncertainty_unit ? {
              real_list: Number(result.uncertainty.real_list) || 1,
              uncertainty_unit: {
                prefix: result.uncertainty.uncertainty_unit.prefix || "",
                unit: result.uncertainty.uncertainty_unit.unit || "",
                eksponen: result.uncertainty.uncertainty_unit.eksponen || "",
              }
            } : {})
          }
        : { 
            factor: "0", 
            probability: "0", 
            distribution: "",
            
            ...(formData.form_type === 'temperature' ? {
              real_list: 1,
              uncertainty_unit: {
                prefix: "",
                unit: "",
                eksponen: "",
              }
            } : {})
          },
    })),
    excel: fileName,
  };
}

function sanitizeData(data: any) {
  return {
    ...data,
    methods: data.methods.map((m: any) => ({
      ...m,
      formula: m.has_formula ? m.formula : null,
      image: m.has_image ? m.image : null,
    })),
    statements: data.statements.map((s: any) => ({
      ...s,
      formula: s.has_formula ? s.formula : null,
      image: s.has_image ? s.image : null,
    })),
    comment: data.comment?.has_file
      ? data.comment
      : { ...data.comment, files: [] },
  };
}

async function processStreamResponse(
  response: Response,
  setProgressPercent: (val: number) => void,
  setProgressMessage: (val: string) => void,
  setPdfBlobUrl: (url: string) => void,
  setIsSubmitted: (val: boolean) => void,
  setIsProcessingSubmission: (val: boolean) => void,
  t: (key: string) => string
) {
  if (!response.body) {
    throw new Error("Response body is null");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  try {
    while (true) {
      const { value, done } = await reader.read();
      
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            
            if (data.error) {
              throw new Error(data.error);
            }

            if (data.progress !== undefined) {
              setProgressPercent(data.progress);
            }

            if (data.message) {
              setProgressMessage(data.message);
            }

            if (data.progress === 100 && data.download_url) {
              setIsSubmitted(true);
              
              const downloadUrl = `http://127.0.0.1:8000${data.download_url}`;
              setPdfBlobUrl(downloadUrl);
              
              toast.success(t("dcc_created_successfully"), {
                description: `Certificate: ${data.certificate_name}`,
                duration: 5000
              });

              setTimeout(() => {
                setIsProcessingSubmission(false);
              }, 2000);
            }

          } catch (parseError) {
            console.error("Error parsing SSE data:", parseError);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

export async function generatePreview(
  formData: any,
  fileName: string,
  setIsProcessingPreview: (val: boolean) => void,
  setPreviewFiles: (files: {pdf: string | null, xml: string | null}) => void
) {
  try {
    setIsProcessingPreview(true);

    const modifiedFormData = prepareFormData(formData, fileName);
    const sanitizedData = sanitizeData(modifiedFormData);
    
    // Log the data being sent to backend
    console.log("Preview data being sent to backend:", JSON.stringify(sanitizedData, null, 2));

    const response = await fetch("http://127.0.0.1:8000/generate-preview/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sanitizeData(modifiedFormData)),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    
    setPreviewFiles({
      pdf: result.pdf_url,
      xml: result.xml_url
    });
    
    setTimeout(() => {
      setIsProcessingPreview(false);
    }, 1000);

  } catch (error) {
    console.error("Error generating preview:", error);
    setIsProcessingPreview(false);
  }
}