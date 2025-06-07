"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  X,
  ChevronsUpDown,
  SlidersHorizontal,
  PencilRuler,
  Thermometer,
  Paperclip,
  Sheet,
} from "lucide-react";
import {
  useFieldArray,
  useForm,
  FormProvider,
  useFormContext,
} from "react-hook-form";
import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from "@/context/LanguageContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MathJax, MathJaxContext } from "better-react-mathjax";
import { latexSymbols, latexOperations } from "@/utils/latexNotations";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Language, fetchLanguages } from "@/utils/language";

declare global {
  interface Window {
    ShowLatexResult: (latex: string, mathml: string) => void;
  }
}

const empty_field_error_message = "Input required/dibutuhkan.";
const FormSchema = z.object({
  methods: z.array(
    z.object({
      method_name: z.record(z.string()).optional(),
      method_desc: z.record(z.string()).optional(),
      norm: z.string().optional(),
      refType: z.string().min(1, { message: empty_field_error_message }),
      has_formula: z.boolean().default(false),
      formula: z
        .object({
          latex: z.string().optional(),
          mathml: z.string().optional(),
        })
        .optional(),
      has_image: z.boolean().default(false),
      image: z
        .object({
          gambar: z.any().optional(),
          caption: z.string().optional(),
        })
        .optional(),
    })
  ),
  equipments: z.array(
    z.object({
      nama_alat: z.record(z.string()).optional(),
      manuf: z.record(z.string()).optional(),
      model: z.record(z.string()).optional(),
      seri_measuring: z.string().min(1, { message: empty_field_error_message }),
      refType: z.string().min(1, { message: empty_field_error_message }),
    })
  ),
  conditions: z.array(
    z.object({
      jenis_kondisi: z.string().min(1, { message: empty_field_error_message }),
      desc: z.record(z.string()).optional(),
      tengah: z.string().min(1, { message: empty_field_error_message }),
      tengah_unit: z.object({
        prefix: z.string().optional(),
        prefix_pdf: z.string().optional(),
        unit: z.string().min(1, { message: empty_field_error_message }),
        unit_pdf: z.string().min(1, { message: empty_field_error_message }),
        eksponen: z.string().optional(),
        eksponen_pdf: z.string().optional(),
      }),
      rentang: z.string().min(1, { message: empty_field_error_message }),
      rentang_unit: z.object({
        prefix: z.string().optional(),
        prefix_pdf: z.string().optional(),
        unit: z.string().min(1, { message: empty_field_error_message }),
        unit_pdf: z.string().min(1, { message: empty_field_error_message }),
        eksponen: z.string().optional(),
        eksponen_pdf: z.string().optional(),
      }),
    })
  ),
  excel: typeof window === "undefined" ? z.any() : z.instanceof(FileList),
  sheet_name: z.string().min(1, { message: empty_field_error_message }),
  results: z.array(
    z.object({
      parameters: z.record(z.string()).optional(),
      columns: z.array(
        z.object({
          kolom: z.record(z.string()).optional(),
          refType: z.string().min(1, { message: empty_field_error_message }),
          real_list: z.string().min(1, { message: empty_field_error_message }),
        })
      ),
      uncertainty: z.object({
        factor: z.string().optional(),
        probability: z.string().optional(),
        distribution: z.string().optional(),
        real_list: z.string().min(1, { message: empty_field_error_message }),
      }),
    })
  ),
});

interface Column {
  kolom: string;
  real_list: string;
}

interface Uncertainty {
  factor: string;
  probability: string;
  distribution: string;
  real_list: string;
}

interface Result {
  parameters: string;
  columns: Column[];
  uncertainty: Uncertainty[];
}

interface FormValues {
  methods: Method[];
  results: Result[];
  excel: string | null;
  sheet_name: string;
  equipments: any[];
  conditions: any[];
}

interface ColumnsProps {
  resultIndex: number;
  usedLanguages: { value: string }[];
  createMultilangObject: (langs: { value: string }[]) => Record<string, string>;
  validLanguages: { value: string }[];
}

interface Method {
  method_name: string;
  method_desc: string;
  norm: string;
  has_formula: boolean;
  formula?: {
    latex?: string;
    mathml?: string;
  };
  has_image: boolean;
  image?: {
    fileName?: File;
    caption?: string;
  };
}

const Columns = ({ resultIndex, usedLanguages, createMultilangObject, validLanguages }: ColumnsProps) => {
  const { control, register } = useFormContext();

  const [selectedDistribution, setDistribution] = useState<string>("");

  const {
    fields: columnFields,
    append: appendColumn,
    remove: removeColumn,
  } = useFieldArray<FormValues>({
    name: `results.${resultIndex}.columns`,
  });

  const { t } = useLanguage();

  const handleAppendColumn = useCallback(() => {
    const currentLanguages = usedLanguages.filter(lang => lang.value && lang.value.trim());

    appendColumn({
      kolom: createMultilangObject(currentLanguages),
      real_list: "1",
    });
  }, [appendColumn, createMultilangObject, usedLanguages]);

  const handleRemoveColumn = useCallback((index: number) => {
    removeColumn(index);
  }, [removeColumn]);

  const [languages, setLanguages] = useState<Language[]>([]);
  useEffect(() => {
    fetchLanguages().then(setLanguages);
  }, []);

  return (
    <div id="columns" className="grid grid-row md:grid-cols-2 gap-4">
      {columnFields.map((columnField, columnIndex) => (
        <Card key={columnField.id} id="kolom" className="border shadow">
          <CardHeader></CardHeader>
          <CardContent className="grid gap-4 pb-4 relative">
            <div id="header">
              <p className="text-sm text-muted-foreground">
                {t("kolom")} {columnIndex + 1}
              </p>
              <p className="text-sm text-red-600">{t("kolom_desc")}</p>
            </div>

            {columnFields.length > 1 && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-0 right-0"
                onClick={() => handleRemoveColumn(columnIndex)}
              >
                <X />
              </Button>
            )}

            <div id="nama">
              <FormLabel variant="mandatory">{t("label")}</FormLabel>
              <div className="grid gap-1">
                {validLanguages.length === 0 ? (
                  <p className="text-sm text-red-600">{t("pilih_bahasa")}</p>
                ) : (
                  validLanguages.map((lang: { value: string }, langIndex: number) => (
                    <FormField
                      key={langIndex}
                      control={control}
                      name={`results.${resultIndex}.columns.${columnIndex}.kolom.${lang.value}`}
                      render={({ field: columnField }) => (
                        <>
                          <FormItem>
                            <FormControl>
                              <Input
                                placeholder={`${t("bahasa")} ${
                                  languages.find(l => l.value === lang.value)?.label || lang.value
                                }`}
                                {...columnField}
                                value={columnField.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        </>
                      )}
                    />
                  ))
                )}
              </div>
            </div>

            <div id="refType">
              <FormLabel variant="mandatory">{t("refType")}</FormLabel>
              <FormField
                control={control}
                name={`results.${resultIndex}.columns.${columnIndex}.refType`}
                render={({ field }) => (
                  <FormItem>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="whitespace-normal">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem
                          value="basic_measuredValue"
                          className="whitespace-normal break-words max-w-xs"
                        >
                          {t("basic_measuredValue")}
                        </SelectItem>
                        <SelectItem
                          value="basic_nominalValue"
                          className="whitespace-normal break-words max-w-xs"
                        >
                          {t("basic_nominalValue")}
                        </SelectItem>
                        <SelectItem
                          value="basic_referenceValue"
                          className="whitespace-normal break-words max-w-xs"
                        >
                          {t("basic_referenceValue")}
                        </SelectItem>
                        <SelectItem
                          value="basic_measurementError_error" // di xml = basic_measurementError (ga bisa 2 value sama)
                          className="whitespace-normal break-words max-w-xs"
                        >
                          {t("basic_measurementError_error")}
                        </SelectItem>
                        <SelectItem
                          value="basic_measurementError_correction" // di xml = basic_measurementError
                          className="whitespace-normal break-words max-w-xs"
                        >
                          {t("basic_measurementError_correction")}
                        </SelectItem>
                        <SelectItem
                          value="other" // ga ada refType
                          className="whitespace-normal break-words max-w-xs"
                        >
                          {t("other")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div id="realList">
              <FormLabel variant="mandatory">{t("subkolom")}</FormLabel>
              <FormField
                control={control}
                name={`results.${resultIndex}.columns.${columnIndex}.real_list`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
      ))}
      <Button
        variant="green"
        type="button"
        size="sm"
        className="mt-4 w-10 h-10 flex items-center justify-center mx-auto"
        onClick={handleAppendColumn}
      >
        <p className="text-xl">
          <Plus />
        </p>
      </Button>

      <Card id="uncertainty" className="border shadow">
        <CardHeader>
          <h3 className="text-sm font-semibold">{t("ketidakpastian")}</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {t("ketidakpastian_desc")}
          </p>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div id="factor" className="grid gap-1">
            <FormLabel>{t("factor")}</FormLabel>
            <FormField
              control={control}
              name={`results.${resultIndex}.uncertainty.factor`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^\d*\.?\d{0,2}$/.test(value)) {
                          field.onChange(e);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div id="probability" className="grid gap-1">
            <FormLabel>{t("probability")}</FormLabel>
            <FormField
              control={control}
              name={`results.${resultIndex}.uncertainty.probability`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      max="1"
                      step={"0.01"}
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^\d*\.?\d{0,2}$/.test(value)) {
                          field.onChange(e);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div id="distribution" className="grid gap-1">
            <FormLabel>{t("distribution")}</FormLabel>
            <FormField
              control={control}
              name={`results.${resultIndex}.uncertainty.distribution`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <FormItem>
                      <Select
                        onValueChange={(value) => {
                          setDistribution(value);
                          field.onChange(value);
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="segiempat">
                            {t("segiempat")}
                          </SelectItem>
                          <SelectItem value="segitiga">
                            {t("segitiga")}
                          </SelectItem>
                          <SelectItem value="other">{t("other")}</SelectItem>
                        </SelectContent>
                      </Select>
                      {selectedDistribution === "other" && (
                        <Input
                          placeholder={`${t("other_distribution")}`}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      )}
                      <FormMessage />
                    </FormItem>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default function MeasurementForm({
  formData,
  updateFormData,
  setFileName,
}: {
  formData: any;
  updateFormData: (data: any) => void;
  setFileName: (name: string) => void;
}) {
  const { t } = useLanguage();

  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: formData,
  });

  // Simple debounced update to prevent infinite loops
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const currentValues = form.getValues();
      updateFormData(currentValues);
    }, 100);

    const subscription = form.watch(() => {
      clearTimeout(timeoutId);
      const timeoutId2 = setTimeout(() => {
        const currentValues = form.getValues();
        updateFormData(currentValues);
      }, 100);
    });

    return () => {
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [form, updateFormData]);

  const [latexInput, setLatexInput] = useState("");
  const latexInputRef = useRef<HTMLInputElement>(null);
  const insertSymbol = (
    latex: string,
    methodIndex: number,
    event?: React.MouseEvent<HTMLButtonElement>
  ) => {
    event?.preventDefault();
    event?.stopPropagation();

    const currentFormula =
      form.getValues(`methods.${methodIndex}.formula.mathjax`) || "";
    const updatedFormula = currentFormula + latex;

    form.setValue(`methods.${methodIndex}.formula.mathjax`, updatedFormula);
  };

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (!name?.startsWith("methods.")) return;

      const match = name.match(/^methods\.(\d+)\.has_formula$/);
      if (match) {
        const index = Number(match[1]);
        const hasFormula = value?.methods?.[index]?.has_formula;
        if (!hasFormula) {
          form.setValue(`methods.${index}.formula`, "");
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (!name?.startsWith("methods.")) return;

      const match = name.match(/^methods\.(\d+)\.has_image$/);
      if (match) {
        const index = Number(match[1]);
        const hasImage = value?.methods?.[index]?.has_image;
        if (!hasImage) {
          form.setValue(`methods.${index}.image`, "");
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  const {
    fields: methodFields,
    append: appendMethod,
    remove: removeMethod,
  } = useFieldArray({
    control: form.control,
    name: "methods",
  });

  const {
    fields: equipmentFields,
    append: appendEquipment,
    remove: removeEquipment,
  } = useFieldArray({
    control: form.control,
    name: "equipments",
  });

  const {
    fields: conditionFields,
    append: appendCondition,
    remove: removeCondition,
  } = useFieldArray({
    control: form.control,
    name: "conditions",
  });

  const [selectedConditions, setSelectedConditions] = useState<{
    [key: number]: string;
  }>({});

  const fileRefExcel = form.register("excel");

  const { control, handleSubmit, register } = form;
  const {
    fields: resultFields,
    append: appendResult,
    remove: removeResult,
  } = useFieldArray({
    control,
    name: "results",
  });

  const [fileName] = useState<string | null>(null);
  const [sheets, setSheets] = useState<string[]>([]);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    isImageUpload: boolean, // true jika upload gambar, false jika upload Excel
    methodIndex?: number // untuk gambar, digunakan untuk mengetahui indeks metode
  ) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];

      // Handle image file upload
      if (isImageUpload) {
        if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
          alert("Please upload a valid image (JPEG/PNG/JPG).");
          return;
        }
        if (file.size > 5000000) {
          alert("File size should be less than 5MB.");
          return;
        }

        const formData = new FormData();
        formData.append("image", file);

        try {
          const response = await fetch("http://127.0.0.1:8000/upload-image/", {
            method: "POST",
            body: formData,
          });

          const result = await response.json();

          // Store file information (name and mimeType) in the form
          if (methodIndex !== undefined) {
            form.setValue(
              `methods.${methodIndex}.image.filename`,
              result.filename // Store the file name after uploading
            );

            form.setValue(
              `methods.${methodIndex}.image.mimeType`,
              result.mimeType // Store the mimeType
            );

            // Convert the image file to base64 for preview
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64String = reader.result as string;

              // Store base64 image string in the form for preview
              form.setValue(
                `methods.${methodIndex}.image.base64`,
                base64String
              );
            };
            reader.readAsDataURL(file); // Convert file to base64
          }

          alert("Image uploaded successfully.");
        } catch (error) {
          console.error("Error uploading image:", error);
          alert("Image upload failed.");
        }
      } else if (file.name.endsWith(".xls") || file.name.endsWith(".xlsx")) {
        const formData = new FormData();
        formData.append("excel", file);

        try {
          const response = await fetch("http://127.0.0.1:8000/upload-excel/", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) throw new Error("Failed to upload file");

          const result = await response.json();
          console.log("Excel file uploaded:", result);

          setFileName(result.filename);
          setSheets(result.sheets || []);

          alert(`Excel file uploaded successfully: ${result.filename}`);
        } catch (error) {
          console.error("Error uploading file:", error);
          alert("File upload failed.");
        }
      } else {
        alert("Please upload a valid file (Excel or Image).");
      }
    }
  };

  const usedLanguages: { value: string }[] =
    form.watch("administrative_data.used_languages") || [];

  const createMultilangObject = useCallback((
    usedLanguages: { value: string }[]
  ): Record<string, string> => {
    const result: Record<string, string> = {};
    usedLanguages.forEach((lang) => {
      if (lang.value?.trim()) {
        result[lang.value] = "";
      }
    });
    return result;
  }, []);

  const [languages, setLanguages] = useState<Language[]>([]);
  useEffect(() => {
    fetchLanguages().then(setLanguages);
  }, []);

  const prefixes = [
    { key: t("yocto"), symbol: "y", value: "\\yocto" },
    { key: "zepto", symbol: "z", value: "\\zepto" },
    { key: "atto", symbol: "a", value: "\\atto" },
    { key: "femto", symbol: "f", value: "\\femto" },
    { key: t("pico"), symbol: "p", value: "\\pico" },
    { key: "nano", symbol: "n", value: "\\nano" },
    { key: t("micro"), symbol: "μ", value: "\\micro" },
    { key: t("milli"), symbol: "m", value: "\\milli" },
    { key: t("centi"), symbol: "c", value: "\\centi" },
    { key: t("deci"), symbol: "d", value: "\\deci" },
    { key: t("deca"), symbol: "da", value: "\\deca" },
    { key: t("hecto"), symbol: "h", value: "\\hecto" },
    { key: "kilo", symbol: "k", value: "\\kilo" },
    { key: "mega", symbol: "M", value: "\\mega" },
    { key: "giga", symbol: "G", value: "\\giga" },
    { key: "tera", symbol: "T", value: "\\tera" },
    { key: "peta", symbol: "P", value: "\\peta" },
    { key: t("exa"), symbol: "E", value: "\\exa" },
    { key: "zetta", symbol: "Z", value: "\\zetta" },
    { key: "yotta", symbol: "Y", value: "\\yotta" },
    { key: "ronna", symbol: "R", value: "\\ronna" },
    { key: "quetta", symbol: "Q", value: "\\quetta" },
    { key: "kibi", symbol: "Ki", value: "\\kibi" },
    { key: "mebi", symbol: "Mi", value: "\\mebi" },
    { key: "gibi", symbol: "Gi", value: "\\gibi" },
    { key: "tebi", symbol: "Ti", value: "\\tebi" },
    { key: "pebi", symbol: "Pi", value: "\\pebi" },
    { key: t("exbi"), symbol: "Ei", value: "\\exbi" },
    { key: "zebi", symbol: "Zi", value: "\\zebi" },
    { key: "yobi", symbol: "Yi", value: "\\yobi" },
  ];

  const units = [
    { key: t("degreeCelsius"), symbol: "°C", value: "\\degreecelsius" },
    { key: t("percent"), symbol: "%", value: "\\percent" },
    { key: t("metre"), symbol: "m", value: "\\metre" },
    { key: "kilogram", symbol: "kg", value: "\\kilogram" },
    { key: t("second"), symbol: "s", value: "\\second" },
    { key: t("ampere"), symbol: "A", value: "\\ampere" },
    { key: "kelvin", symbol: "K", value: "\\kelvin" },
    { key: t("mole"), symbol: "mol", value: "\\mole" },
    { key: t("candela"), symbol: "cd", value: "\\candela" },
    { key: t("one"), symbol: "1", value: "\\one" },
    { key: t("day"), symbol: "d", value: "\\day" },
    { key: t("hour"), symbol: "h", value: "\\hour" },
    { key: t("minute"), symbol: "min", value: "\\minute" },
    { key: t("degree"), symbol: "°", value: "\\degree" },
    { key: t("arcminute"), symbol: "'", value: "\\arcminute" },
    { key: t("arcsecond"), symbol: "”", value: "\\arcsecond" },
    { key: "gram", symbol: "g", value: "\\gram" },
    { key: "radian", symbol: "rad", value: "\\radian" },
    { key: "steradian", symbol: "sr", value: "\\steradian" },
    { key: "hertz", symbol: "Hz", value: "\\hertz" },
    { key: "newton", symbol: "N", value: "\\newton" },
    { key: "pascal", symbol: "Pa", value: "\\pascal" },
    { key: "joule", symbol: "J", value: "\\joule" },
    { key: "watt", symbol: "W", value: "\\watt" },
    { key: "coulomb", symbol: "C", value: "\\coulomb" },
    { key: "volt", symbol: "V", value: "\\volt" },
    { key: "farad", symbol: "F", value: "\\farad" },
    { key: "ohm", symbol: "Ω", value: "\\ohm" },
    { key: "siemens", symbol: "S", value: "\\siemens" },
    { key: "weber", symbol: "Wb", value: "\\weber" },
    { key: "tesla", symbol: "T", value: "\\tesla" },
    { key: "henry", symbol: "H", value: "\\henry" },
    { key: "lumen", symbol: "lm", value: "\\lumen" },
    { key: "lux", symbol: "lx", value: "\\lux" },
    { key: "becquerel", symbol: "Bq", value: "\\becquerel" },
    { key: "sievert", symbol: "Sv", value: "\\sievert" },
    { key: "gray", symbol: "Gy", value: "\\gray" },
    { key: "katal", symbol: "kat", value: "\\katal" },
    { key: "bit", symbol: "bit", value: "\\bit" },
    { key: t("byte"), symbol: "B", value: "\\byte" },
    { key: "ppm", symbol: "ppm", value: "\\ppm" },
    { key: t("hectare"), symbol: "ha", value: "\\hectare" },
    { key: t("litre"), symbol: "l", value: "\\litre" },
    { key: t("tonne"), symbol: "t", value: "\\tonne" },
    { key: t("electronvolt"), symbol: "eV", value: "\\electronvolt" },
    { key: "dalton", symbol: "Da", value: "\\dalton" },
    { key: t("astronomicalUnit"), symbol: "au", value: "\\astronomicalunit" },
    { key: "neper", symbol: "Np", value: "\\neper" },
    { key: "bel", symbol: "B", value: "\\bel" },
    { key: t("decibel"), symbol: "dB", value: "\\decibel" },
    { key: "bar", symbol: "bar", value: "\\bar" },
    { key: t("mmHg"), symbol: "mmHg", value: "\\mmHg" },
    { key: "angstrom", symbol: "Å", value: "\\angstrom" },
    { key: t("nauticalmile"), symbol: "M", value: "\\nauticalmile" },
    { key: "barn", symbol: "b", value: "\\barn" },
    { key: "knot", symbol: "kn", value: "\\knot" },
    { key: "erg", symbol: "erg", value: "\\erg" },
    { key: "dyne", symbol: "dyn", value: "\\dyne" },
    { key: "poise", symbol: "P", value: "\\poise" },
    { key: "stokes", symbol: "ST", value: "\\stokes" },
    { key: "stilb", symbol: "sb", value: "\\stilb" },
    { key: "phot", symbol: "ph", value: "\\phot" },
    { key: "gal", symbol: "Gal", value: "\\gal" },
    { key: "maxwell", symbol: "Mx", value: "\\maxwell" },
    { key: "gauss", symbol: "G", value: "\\gauss" },
    { key: "œrsted", symbol: "Oe", value: "\\oersted" },
  ];

  const handleRemoveMethod = useCallback((index: number) => {
    removeMethod(index);
  }, [removeMethod]);

  const handleAppendMethod = useCallback(() => {
    const currentLanguages = usedLanguages.filter(lang => lang.value && lang.value.trim());
    
    appendMethod({
      method_name: createMultilangObject(currentLanguages),
      method_desc: createMultilangObject(currentLanguages),
      norm: "",
      has_formula: false,
      formula: {
        latex: "",
        mathml: "",
      },
      image: {
        fileName: "",
        caption: "",
        base64: "",
        mimeType: "",
      },
    });
  }, [appendMethod, createMultilangObject, usedLanguages]);

  const handleRemoveEquipment = useCallback((index: number) => {
    removeEquipment(index);
  }, [removeEquipment]);

  const handleAppendEquipment = useCallback(() => {
    const currentLanguages = usedLanguages.filter(lang => lang.value && lang.value.trim());
    
    appendEquipment({
      nama_alat: createMultilangObject(currentLanguages),
      manuf_model: createMultilangObject(currentLanguages),
      model: createMultilangObject(currentLanguages),
      seri_measuring: "",
    });
  }, [appendEquipment, createMultilangObject, usedLanguages]);

  const handleRemoveCondition = useCallback((index: number) => {
    removeCondition(index);
  }, [removeCondition]);

  const handleAppendCondition = useCallback(() => {
    const currentLanguages = usedLanguages.filter(lang => lang.value && lang.value.trim());
    
    appendCondition({
      jenis_kondisi: "", // Initialize with empty string to avoid undefined issues
      desc: createMultilangObject(currentLanguages),
      tengah: "", // Default empty value for tengah
      tengah_unit: {
        prefix: "", // Default empty value for prefix
        unit: "", // Default empty value for unit
        eksponen: "", // Default empty value for eksponen
        prefix_pdf: "", // Default empty value for prefix_pdf
        unit_pdf: "", // Default empty value for unit_pdf
        eksponen_pdf: "", // Default empty value for eksponen_pdf
      },
      rentang: "", // Default empty value for rentang
      rentang_unit: {
        prefix: "", // Default empty value for prefix
        unit: "", // Default empty value for unit
        eksponen: "", // Default empty value for eksponen
        prefix_pdf: "", // Default empty value for prefix_pdf
        unit_pdf: "", // Default empty value for unit_pdf
        eksponen_pdf: "", // Default empty value for eksponen_pdf
      },
    });
  }, [appendCondition, createMultilangObject, usedLanguages]);

  const handleRemoveResult = useCallback((index: number) => {
    removeResult(index);
  }, [removeResult]);

  const handleAppendResult = useCallback(() => {
    const currentLanguages = usedLanguages.filter(lang => lang.value && lang.value.trim());
    
    appendResult({
      parameters: createMultilangObject(currentLanguages),
      columns: [
        {
          kolom: createMultilangObject(currentLanguages),
          real_list: [
            {
              value: "",
              unit: "",
            },
          ],
        },
      ],
    });
  }, [appendResult, createMultilangObject, usedLanguages]);

  const onSubmit = async (data: FormValues) => {
    // const combinedParameters = data.results.map((result) =>
    //   result.parameters.join(", ")
    // );

    // Perbarui data form dengan parameter yang telah digabung
    const modifiedFormData = {
      ...data,
      results: data.results.map((result, index) => ({
        ...result,
        // parameters: combinedParameters[index], // Pastikan parameters adalah string
      })),
    };

    try {
      const cleanedMethods = modifiedFormData.methods.map((method, index) => {
        if (!method.has_formula) {
          form.setValue(`methods.${index}.formula`, "");
          const { formula, ...rest } = method;
          return rest;
        }
        return method;
      });

      const cleanedMethodsWithImage = cleanedMethods.map((method: Method) => {
        if (!method.has_image || !method.image || !method.image.fileName) {
          return { ...method, image: undefined };
        }
        return method;
      });

      const formData = {
        ...modifiedFormData,
        methods: cleanedMethodsWithImage,
        excel: fileName,
      };

      const response = await fetch("http://127.0.0.1:8000/create-dcc/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorResult = await response.json();
        console.error("Error response from server:", errorResult);
        alert(`Failed to create DCC: ${errorResult.detail}`);
        return;
      }

      const result = await response.json();
      console.log("DCC Created:", result);
      alert(`DCC Created! Download: ${result.download_link}`);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred while submitting the form.");
    }
  };

  const validLanguages = usedLanguages.filter(lang => lang.value && lang.value.trim());

  return (
    <FormProvider {...form}>
      <form
        onSubmit={(e) => {
          console.log("Form submitted!");
          form.handleSubmit(onSubmit)(e);
        }}
        className="space-y-16 max-w-4xl mx-auto p-4"
      >
        <Card id="used_method">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5" />
              {t("metode")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {methodFields.map((field, index) => (
              <div key={field.id} className="grid gap-4 border-b pb-4 relative">
                <CardDescription>
                  {t("metode")} {index + 1}
                </CardDescription>
                {methodFields.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-0 right-0"
                    onClick={() => handleRemoveMethod(index)}
                  >
                    <X />
                  </Button>
                )}
                <div className="grid grid-row md:grid-cols-2 gap-4">
                  <div id="method_name">
                    <FormLabel variant="mandatory">{t("nama")}</FormLabel>
                    <div className="space-y-1">
                      {validLanguages.length === 0 ? (
                        <p className="text-sm text-red-600">{t("pilih_bahasa")}</p>
                      ) : (
                        validLanguages.map((lang: { value: string }, langIndex: number) => (
                          <FormField
                            control={form.control}
                            key={`${field.id}-method_name-${lang.value}`}
                            name={`methods.${index}.method_name.${lang.value}`}
                            render={({ field: methodNameField }) => (
                              <FormItem>
                                <div className="flex items-center gap-2">
                                  <FormControl>
                                    <Input
                                      placeholder={`${t("bahasa")} ${
                                        languages.find(l => l.value === lang.value)?.label || lang.value
                                      }`}
                                      {...methodNameField}
                                      value={methodNameField.value || ""}
                                    />
                                  </FormControl>
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        ))
                      )}
                    </div>
                  </div>

                  <div id="norm">
                    <FormLabel>{t("norm")}</FormLabel>
                    <FormField
                      control={form.control}
                      name={`methods.${index}.norm`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div id="method_desc">
                  <FormLabel>{t("deskripsi")}</FormLabel>
                  <div className="space-y-1">
                    {validLanguages.length === 0 ? (
                        <p className="text-sm text-red-600">{t("pilih_bahasa")}</p>
                      ) : (
                        validLanguages.map((lang: { value: string }, langIndex: number) => (
                          <FormField
                            control={form.control}
                            key={`${field.id}-method_desc-${langIndex}`}
                            name={`methods.${index}.method_desc.${lang.value}`}
                            render={({ field: methodDescField }) => (
                              <FormItem>
                                <div className="flex items-center gap-2">
                                  <FormControl>
                                    <Input
                                      placeholder={`${t("bahasa")} ${
                                        languages.find(l => l.value === lang.value)?.label || lang.value
                                      }`}
                                      {...methodDescField}
                                      value={methodDescField.value || ""}
                                    />
                                  </FormControl>
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                      ))
                    )}
                  </div>
                </div>

                <div id="refType" className="mb-3">
                  <FormLabel variant="mandatory">{t("refType")}</FormLabel>
                  <FormField
                    control={form.control}
                    name={`methods.${index}.refType`}
                    render={({ field }) => (
                      <FormItem>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="whitespace-normal">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem
                              value="basic_methodMeasurementUncertainty"
                              className="whitespace-normal break-words max-w-xs md:max-w-2xl lg:max-w-3xl"
                            >
                              {t("basic_methodMeasurementUncertainty")}
                            </SelectItem>
                            <SelectItem
                              value="basic_calibrationMethod"
                              className="whitespace-normal break-words max-w-xs md:max-w-2xl lg:max-w-3xl"
                            >
                              {t("other")}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div id="checkbox_rumus">
                  <FormField
                    control={form.control}
                    name={`methods.${index}.has_formula`}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={(checked) =>
                              field.onChange(checked)
                            }
                          />
                        </FormControl>
                        <FormLabel>{t("cb_rumus_metode")}</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>

                {form.watch(`methods.${index}.has_formula`) && (
                  <div id="rumus" className="mb-2">
                    <FormLabel>{t("rumus")}</FormLabel>
                    <div className="grid grid-row md:grid-cols-2 gap-1">
                      <FormField
                        control={form.control}
                        name={`methods.${index}.formula.latex`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input placeholder="LaTeX" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`methods.${index}.formula.mathml`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input placeholder="MathML" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="blue"
                      className="mt-1"
                      onClick={() => {
                        const latex = form.getValues(
                          `methods.${index}.formula.latex`
                        );
                        const encodedLatex = encodeURIComponent(latex || "");

                        const popup = window.open(
                          `/imatheq.html?latex=${encodedLatex}`, // adjust to your actual path
                          "mathEditorPopup",
                          "width=800,height=600"
                        );

                        // Define the callback function to receive LaTeX from the popup
                        window.ShowLatexResult = (latex, mathml) => {
                          form.setValue(
                            `methods.${index}.formula.latex`,
                            latex
                          );
                          form.setValue(
                            `methods.${index}.formula.mathml`,
                            mathml
                          );
                        };
                      }}
                    >
                      {t("editor")}
                    </Button>
                  </div>
                )}
                <MathJaxContext>
                  <div id="rumus" className="mt-2">
                    <FormLabel>Rumus</FormLabel>
                    <div className="grid grid-row md:grid-cols-2 gap-4">
                      <div className="grid gap-4">
                        <FormField
                          control={form.control}
                          name={`methods.${index}.formula.mathjax`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  ref={latexInputRef}
                                  value={
                                    form.watch(
                                      `methods.${index}.formula.mathjax`
                                    ) ?? ""
                                  }
                                  onChange={(e) =>
                                    form.setValue(
                                      `methods.${index}.formula.mathjax`,
                                      e.target.value
                                    )
                                  }
                                  placeholder="LaTeX"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Card className="border shadow">
                          <CardContent>
                            <MathJax>{`$$${
                              form.watch(`methods.${index}.formula.mathjax`) ||
                              ""
                            }$$`}</MathJax>
                          </CardContent>
                        </Card>
                      </div>
                      <ScrollArea className="h-40 w-full border rounded-md p-2">
                        <div className="p-2">
                          <div className="grid grid-row md:grid-cols-2 gap-2">
                            {latexSymbols.map((group) => (
                              <div key={group.category}>
                                <Select
                                  onValueChange={(value) =>
                                    insertSymbol(value, index)
                                  }
                                >
                                  <SelectTrigger>
                                    <span>{group.category}</span>
                                  </SelectTrigger>
                                  <SelectContent>
                                    {group.symbols.map(
                                      ({ latex, description }) => (
                                        <SelectItem key={latex} value={latex}>
                                          <span className="inline-flex items-center">
                                            <MathJax>{`\\(${latex}\\)`}</MathJax>
                                            <span className="ml-1">
                                              {description}
                                            </span>
                                          </span>
                                        </SelectItem>
                                      )
                                    )}
                                  </SelectContent>
                                </Select>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="p-2">
                          <div className="grid grid-cols-8 gap-1">
                            {latexOperations
                              .find((group) => group.category === "small")
                              ?.symbols.map(({ latex }) => (
                                <Button
                                  variant="secondary"
                                  key={latex}
                                  onClick={(e) => insertSymbol(latex, index, e)}
                                >
                                  <span className="text-lg">
                                    <MathJax>{`\\(${latex}\\)`}</MathJax>
                                  </span>
                                </Button>
                              ))}
                          </div>
                          <div className="grid grid-cols-5 gap-1 mt-1">
                            {latexOperations
                              .find((group) => group.category === "long")
                              ?.symbols.map(({ latex }) => (
                                <Button
                                  variant="secondary"
                                  key={latex}
                                  value={latex}
                                  onClick={(e) => insertSymbol(latex, index, e)}
                                >
                                  <span>
                                    <MathJax>{`\\(${latex}\\)`}</MathJax>
                                  </span>
                                </Button>
                              ))}
                          </div>
                          <div className="grid grid-cols-5 gap-1 mt-1">
                            {latexOperations
                              .find((group) => group.category === "big")
                              ?.symbols.map(({ latex }) => (
                                <Button
                                  variant="secondary"
                                  key={latex}
                                  value={latex}
                                  onClick={(e) => insertSymbol(latex, index, e)}
                                  className="h-15"
                                >
                                  <span>
                                    <MathJax>{`\\(${latex}\\)`}</MathJax>
                                  </span>
                                </Button>
                              ))}
                          </div>
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                </MathJaxContext>

                <div id="checkbox_gambar">
                  <FormField
                    control={form.control}
                    name={`methods.${index}.has_image`}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={(checked) =>
                              field.onChange(checked)
                            }
                          />
                        </FormControl>
                        <FormLabel>{t("cb_gambar_metode")}</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>

                {form.watch(`methods.${index}.has_image`) && (
                  <div id="gambar">
                    <div className="grid grid-row md:grid-cols-2 gap-4">
                      <div id="upload">
                        <FormLabel>{t("upload_gambar")}</FormLabel>
                        <FormField
                          control={form.control}
                          name={`methods.${index}.image.fileName`}
                          render={({ field: { onChange, ref } }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="file"
                                  accept=".jpg, .jpeg, .png"
                                  ref={ref}
                                  onChange={(e) =>
                                    handleFileUpload(e, true, index)
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div id="caption">
                        <FormLabel>{t("caption")}</FormLabel>
                        <FormField
                          control={form.control}
                          name={`methods.${index}.image.caption`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <Button
              variant="green"
              type="button"
              size="sm"
              className="mt-4 w-10 h-10 flex items-center justify-center mx-auto"
              onClick={handleAppendMethod}
            >
              <p className="text-xl">
                <Plus />
              </p>
            </Button>
          </CardContent>
        </Card>

        <Card id="measuring_equipment">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PencilRuler className="w-5 h-5" />
              {t("pengukuran")}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-4">
              {equipmentFields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid gap-4 border-b pb-4 relative"
                >
                  <CardDescription>
                    {t("alat")} {index + 1}
                  </CardDescription>
                  {equipmentFields.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-0 right-0"
                      onClick={() => handleRemoveEquipment(index)}
                    >
                      <X />
                    </Button>
                  )}
                  <div className="grid grid-row md:grid-cols-2 gap-4">
                    <div id="nama_alat">
                      <FormLabel variant="mandatory">{t("nama")}</FormLabel>
                      <div className="space-y-1">
                        {validLanguages.length === 0 ? (
                          <p className="text-sm text-red-600">{t("pilih_bahasa")}</p>
                        ) : (
                          validLanguages.map((lang: { value: string }, langIndex: number) => (
                            <FormField
                              control={form.control}
                              key={`${field.id}-nama_alat-${langIndex}`}
                              name={`equipments.${index}.nama_alat.${lang.value}`}
                              render={({ field: namaAlatField }) => (
                                <FormItem>
                                  <div className="flex items-center gap-2">
                                    <FormControl>
                                      <Input
                                        placeholder={`${t("bahasa")} ${
                                          languages.find(l => l.value === lang.value)?.label || lang.value
                                        }`}
                                        {...namaAlatField}
                                        value={namaAlatField.value || ""}
                                      />
                                    </FormControl>
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          ))
                        )}
                      </div>
                    </div>
                    <div id="seri_measuring">
                      <FormLabel variant="mandatory">{t("seri")}</FormLabel>
                      <FormField
                        control={form.control}
                        name={`equipments.${index}.seri_measuring`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  <div className="grid grid-row md:grid-cols-2 gap-4">
                    <div id="manuf_model">
                      <FormLabel>{t("manuf")}</FormLabel>
                      <div className="space-y-1">
                        {validLanguages.length === 0 ? (
                          <p className="text-sm text-red-600">{t("pilih_bahasa")}</p>
                        ) : (
                          validLanguages.map((lang: { value: string }, langIndex: number) => (
                            <FormField
                              control={form.control}
                              key={`${field.id}-manuf_model-${langIndex}`}
                              name={`equipments.${index}.manuf_model.${lang.value}`}
                              render={({ field: manufField }) => (
                                <FormItem>
                                  <div className="flex items-center gap-2">
                                    <FormControl>
                                      <Input
                                        placeholder={`${t("bahasa")} ${
                                          languages.find(l => l.value === lang.value)?.label || lang.value
                                        }`}
                                        {...manufField}
                                        value={manufField.value || ""}
                                      />
                                    </FormControl>
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          ))
                        )}
                      </div>
                    </div>
                    <div id="model">
                      <FormLabel>{t("model")}</FormLabel>
                      <div className="space-y-1">
                        {validLanguages.length === 0 ? (
                          <p className="text-sm text-red-600">{t("pilih_bahasa")}</p>
                        ) : (
                          validLanguages.map((lang: { value: string }, langIndex: number) => (
                            <FormField
                              control={form.control}
                              key={`${field.id}-model-${langIndex}`}
                              name={`equipments.${index}.model.${lang.value}`}
                              render={({ field: modelField }) => (
                                <FormItem>
                                  <div className="flex items-center gap-2">
                                    <FormControl>
                                      <Input
                                        placeholder={`${t("bahasa")} ${
                                          languages.find(l => l.value === lang.value)?.label || lang.value
                                        }`}
                                        {...modelField}
                                        value={modelField.value || ""}
                                      />
                                    </FormControl>
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                  <div id="refType">
                    <FormLabel variant="mandatory">{t("refType")}</FormLabel>
                    <FormField
                      control={form.control}
                      name={`equipments.${index}.refType`}
                      render={({ field }) => (
                        <FormItem>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="whitespace-normal">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem
                                value="basic_measurementStandard"
                                className="whitespace-normal break-words max-w-xs md:max-w-2xl lg:max-w-3xl"
                              >
                                {t("basic_measurementStandard")}
                              </SelectItem>
                              <SelectItem
                                value="other" // ga ada refType
                                className="whitespace-normal break-words max-w-xs md:max-w-2xl lg:max-w-3xl"
                              >
                                {t("other")}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant="green"
              type="button"
              size="sm"
              className="mt-4 w-10 h-10 flex items-center justify-center mx-auto"
              onClick={handleAppendEquipment}
            >
              <p className="text-xl">
                <Plus />
              </p>
            </Button>
          </CardContent>
        </Card>

        <Card id="influence_condition">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Thermometer className="w-5 h-5" />
              {t("kondisi")}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-4">
              {conditionFields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid gap-4 border-b pb-4 relative"
                >
                  <CardDescription>Parameter {index + 1}</CardDescription>
                  {conditionFields.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-0 right-0"
                      onClick={() => handleRemoveCondition(index)}
                    >
                      <X />
                    </Button>
                  )}
                  <div className="grid grid-row md:grid-cols-2 gap-4">
                    <div id="jenis_kondisi">
                      <FormLabel variant="mandatory">
                        {t("lingkungan")}
                      </FormLabel>
                      <FormField
                        control={form.control}
                        name={`conditions.${index}.jenis_kondisi`}
                        render={({ field }) => (
                          <FormItem>
                            <Select
                              onValueChange={(value) => {
                                setSelectedConditions((prev) => ({
                                  ...prev,
                                  [index]: value,
                                }));
                                field.onChange(value);
                              }}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Suhu">
                                  {t("suhu")}
                                </SelectItem>
                                <SelectItem value="Kelembapan Relatif">
                                  {t("lembap")}
                                </SelectItem>
                                <SelectItem value="other">
                                  {t("other")}
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            {selectedConditions[index] === "other" && (
                              <Input
                                placeholder={`${t("other_condition")}`}
                                onChange={(e) => field.onChange(e.target.value)}
                              />
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div id="kondisi_desc">
                      <FormLabel>{t("deskripsi")}</FormLabel>
                      <div className="space-y-1">
                        {validLanguages.length === 0 ? (
                          <p className="text-sm text-red-600">{t("pilih_bahasa")}</p>
                        ) : (
                          validLanguages.map((lang: { value: string }, langIndex: number) => (
                            <FormField
                              control={form.control}
                              key={`${field.id}-desc-${langIndex}`}
                              name={`conditions.${index}.desc.${lang.value}`}
                              render={({ field: kondisiDescField }) => (
                                <FormItem>
                                  <div className="flex items-center gap-2">
                                    <FormControl>
                                      <Input
                                        placeholder={`${t("bahasa")} ${
                                          languages.find(l => l.value === lang.value)?.label || lang.value
                                        }`}
                                        {...kondisiDescField}
                                        value={kondisiDescField.value || ""}
                                      />
                                    </FormControl>
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                  <div id="tengah">
                    <div className="grid grid-row md:grid-cols-2 gap-4">
                      <div id="tengah_value">
                        <FormLabel variant="mandatory">{t("tengah")}</FormLabel>
                        <FormField
                          control={form.control}
                          name={`conditions.${index}.tengah`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input placeholder={t("nilai")} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div id="tengah_unit">
                        <FormLabel>{t("satuan")}</FormLabel>
                        <div className="grid grid-cols-3 gap-1">
                          <div id="prefix">
                            <FormField
                              control={form.control}
                              name={`conditions.${index}.tengah_unit.prefix`}
                              render={({ field }) => (
                                <FormItem>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <FormControl>
                                        <Button
                                          variant="outline"
                                          role="combobox"
                                          className="w-full justify-between"
                                        >
                                          {field.value
                                            ? prefixes.find(
                                                (p) => p.value === field.value
                                              )?.symbol
                                            : `${t("prefix")}`}
                                          <ChevronsUpDown className="opacity-50" />
                                        </Button>
                                      </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                                      <Command>
                                        <CommandInput className="h-9" />
                                        <CommandList>
                                          <CommandGroup>
                                            {prefixes.map((prefix) => (
                                              <CommandItem
                                                key={prefix.value}
                                                value={`${prefix.key} ${prefix.symbol}`}
                                                onSelect={() => {
                                                  form.setValue(
                                                    `conditions.${index}.tengah_unit.prefix`,
                                                    prefix.value
                                                  );
                                                  form.setValue(
                                                    `conditions.${index}.tengah_unit.prefix_pdf`,
                                                    prefix.symbol
                                                  );
                                                }}
                                              >
                                                {`${prefix.key} (${prefix.symbol})`}
                                              </CommandItem>
                                            ))}
                                          </CommandGroup>
                                        </CommandList>
                                      </Command>
                                    </PopoverContent>
                                  </Popover>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div id="unit">
                            <FormField
                              control={form.control}
                              name={`conditions.${index}.tengah_unit.unit`}
                              render={({ field }) => (
                                <FormItem>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <FormControl>
                                        <Button
                                          variant="outline"
                                          role="combobox"
                                          className="w-full justify-between"
                                        >
                                          {field.value ? (
                                            units.find(
                                              (p) => p.value === field.value
                                            )?.symbol
                                          ) : (
                                            <span>
                                              {t("satuan")}
                                              <span className="text-red-600">
                                                {" "}
                                                *
                                              </span>
                                            </span>
                                          )}
                                          <ChevronsUpDown className="opacity-50" />
                                        </Button>
                                      </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                                      <Command>
                                        <CommandInput className="h-9" />
                                        <CommandList>
                                          <CommandGroup>
                                            {units.map((unit) => (
                                              <CommandItem
                                                key={unit.value}
                                                value={`${unit.key} ${unit.symbol}`}
                                                onSelect={() => {
                                                  form.setValue(
                                                    `conditions.${index}.tengah_unit.unit`,
                                                    unit.value
                                                  );
                                                  form.setValue(
                                                    `conditions.${index}.tengah_unit.unit_pdf`,
                                                    unit.symbol
                                                  );
                                                }}
                                              >
                                                {`${unit.key} (${unit.symbol})`}
                                              </CommandItem>
                                            ))}
                                          </CommandGroup>
                                        </CommandList>
                                      </Command>
                                    </PopoverContent>
                                  </Popover>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div id="eksponen">
                            <FormField
                              control={form.control}
                              name={`conditions.${index}.tengah_unit.eksponen`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      placeholder={t("eksponen")}
                                      value={field.value}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        field.onChange(value); // update eksponen
                                        form.setValue(
                                          `conditions.${index}.tengah_unit.eksponen_pdf`,
                                          `\\tothe{${value}}`
                                        ); // update eksponen_pdf
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div id="rentang">
                    <div className="grid grid-row md:grid-cols-2 gap-4">
                      <div id="rentang_value">
                        <FormLabel variant="mandatory">
                          {t("rentang")}
                        </FormLabel>
                        <FormField
                          control={form.control}
                          name={`conditions.${index}.rentang`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input placeholder={t("nilai")} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div id="rentang_unit">
                        <FormLabel>{t("satuan")}</FormLabel>
                        <div className="grid grid-cols-3 gap-1">
                          <div id="prefix">
                            <FormField
                              control={form.control}
                              name={`conditions.${index}.rentang_unit.prefix`}
                              render={({ field }) => (
                                <FormItem>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <FormControl>
                                        <Button
                                          variant="outline"
                                          role="combobox"
                                          className="w-full justify-between"
                                        >
                                          {field.value
                                            ? prefixes.find(
                                                (p) => p.value === field.value
                                              )?.symbol
                                            : `${t("prefix")}`}
                                          <ChevronsUpDown className="opacity-50" />
                                        </Button>
                                      </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                                      <Command>
                                        <CommandInput className="h-9" />
                                        <CommandList>
                                          <CommandGroup>
                                            {prefixes.map((prefix) => (
                                              <CommandItem
                                                key={prefix.value}
                                                value={`${prefix.key} ${prefix.symbol}`}
                                                onSelect={() => {
                                                  form.setValue(
                                                    `conditions.${index}.rentang_unit.prefix`,
                                                    prefix.value
                                                  );
                                                  form.setValue(
                                                    `conditions.${index}.rentang_unit.prefix_pdf`,
                                                    prefix.symbol
                                                  );
                                                }}
                                              >
                                                {`${prefix.key} (${prefix.symbol})`}
                                              </CommandItem>
                                            ))}
                                          </CommandGroup>
                                        </CommandList>
                                      </Command>
                                    </PopoverContent>
                                  </Popover>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div id="unit">
                            <FormField
                              control={form.control}
                              name={`conditions.${index}.rentang_unit.unit`}
                              render={({ field }) => (
                                <FormItem>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <FormControl>
                                        <Button
                                          variant="outline"
                                          role="combobox"
                                          className="w-full justify-between"
                                        >
                                          {field.value ? (
                                            units.find(
                                              (p) => p.value === field.value
                                            )?.symbol
                                          ) : (
                                            <span>
                                              {t("satuan")}
                                              <span className="text-red-600">
                                                {" "}
                                                *
                                              </span>
                                            </span>
                                          )}
                                          <ChevronsUpDown className="opacity-50" />
                                        </Button>
                                      </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                                      <Command>
                                        <CommandInput className="h-9" />
                                        <CommandList>
                                          <CommandGroup>
                                            {units.map((unit) => (
                                              <CommandItem
                                                key={unit.value}
                                                value={`${unit.key} ${unit.symbol}`}
                                                onSelect={() => {
                                                  form.setValue(
                                                    `conditions.${index}.rentang_unit.unit`,
                                                    unit.value
                                                  );
                                                  form.setValue(
                                                    `conditions.${index}.rentang_unit.unit_pdf`,
                                                    unit.symbol
                                                  );
                                                }}
                                              >
                                                {`${unit.key} (${unit.symbol})`}
                                              </CommandItem>
                                            ))}
                                          </CommandGroup>
                                        </CommandList>
                                      </Command>
                                    </PopoverContent>
                                  </Popover>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div id="eksponen">
                            <FormField
                              control={form.control}
                              name={`conditions.${index}.rentang_unit.eksponen`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      placeholder={t("eksponen")}
                                      value={field.value}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        field.onChange(value); // update eksponen
                                        form.setValue(
                                          `conditions.${index}.rentang_unit.eksponen_pdf`,
                                          `\\tothe{${value}}`
                                        ); // update eksponen_pdf
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant="green"
              type="button"
              size="sm"
              className="mt-4 w-10 h-10 flex items-center justify-center mx-auto"
              onClick={handleAppendCondition}
            >
              <Plus />
            </Button>
          </CardContent>
        </Card>

        <Card id="excel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Paperclip className="w-5 h-5" />
              {t("lampiran")}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-row md:grid-cols-2 gap-4">
            <div id="excel_file">
              <FormLabel variant="mandatory">{t("excel")}</FormLabel>
              <FormField
                control={form.control}
                name="excel"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="file"
                          {...fileRefExcel}
                          accept=".xls,.xlsx"
                          onChange={(e) => handleFileUpload(e, false)}
                        />
                      </FormControl>
                      <FormDescription>{t("excel_desc")}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>
            <div id="sheet">
              <FormLabel variant="mandatory">{t("sheet")}</FormLabel>
              <FormField
                control={form.control}
                name="sheet_name"
                render={({ field }) => (
                  <FormItem>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <FormDescription>{t("sheet_desc")}</FormDescription>
                      <SelectContent>
                        {sheets.map((sheet, index) => (
                          <SelectItem key={index} value={sheet}>
                            {sheet}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card id="hasil">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sheet className="w-5 h-5" />
              {t("hasil")}
            </CardTitle>
          </CardHeader>

          <CardContent className="grid gap-6">
            <div className="grid gap-4">
              {resultFields.map((resultField, resultIndex) => (
                <div
                  key={resultField.id}
                  className="grid gap-4 border-b pb-4 relative"
                >
                  <p className="text-sm text-muted-foreground">
                    Parameter {resultIndex + 1}
                  </p>

                  {resultFields.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-0 right-0"
                      onClick={() => handleRemoveResult(resultIndex)}
                    >
                      <X />
                    </Button>
                  )}

                  <div id="parameter">
                    <FormLabel variant="mandatory">{t("judul")}</FormLabel>
                    <div className="space-y-1">
                      {validLanguages.length === 0 ? (
                        <p className="text-sm text-red-600">{t("pilih_bahasa")}</p>
                      ) : (
                        validLanguages.map((lang: { value: string }, langIndex: number) => (
                          <FormField
                            key={lang.value}
                            control={form.control}
                            name={`results.${resultIndex}.parameters.${lang.value}`}
                            render={({ field: parameterField }) => (
                              <>
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      placeholder={`${t("bahasa")} ${
                                        languages.find(l => l.value === lang.value)?.label || lang.value
                                      }`}
                                      {...parameterField}
                                      value={
                                        typeof parameterField.value === "string"
                                          ? parameterField.value
                                          : ""
                                      }
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              </>
                            )}
                          />
                        ))
                      )}
                    </div>
                  </div>

                  <Columns
                    resultIndex={resultIndex}
                    usedLanguages={usedLanguages}
                    createMultilangObject={createMultilangObject}
                    validLanguages={validLanguages}
                  />
                </div>
              ))}
            </div>
            <Button
              variant="green"
              type="button"
              size="sm"
              className="mt-4 w-10 h-10 flex items-center justify-center mx-auto"
              onClick={handleAppendResult}
            >
              <p className="text-xl">
                <Plus />
              </p>
            </Button>
          </CardContent>
        </Card>
      </form>
    </FormProvider>
  );
}
