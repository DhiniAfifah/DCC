"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ChevronsUpDown,
  CalendarIcon,
  Plus,
  X,
  FolderCode,
  ClipboardList,
  Package,
  UserCheck,
  FileUser,
} from "lucide-react";
import { useFieldArray, useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import { Language, fetchLanguages } from "@/utils/language";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { useLanguage } from "@/context/LanguageContext";

type Country = { label: string; value: string };
const fetchCountries = async (): Promise<Country[]> => {
  try {
    const response = await axios.get(
      "https://restcountries.com/v3.1/all?fields=name,cca2"
    );

    return response.data
      .map((country: any) => ({
        label: country?.name?.common ?? "Unknown",
        value: country?.cca2 ?? "XX",
      }))
      .sort((a: Country, b: Country) => a.label.localeCompare(b.label));
  } catch (error) {
    console.error("Error fetching countries:", error);
    return [];
  }
};

const empty_field_error_message = "Input required/dibutuhkan.";

const dateField = z.union([
  z.date(),
  z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: empty_field_error_message, // custom message
  }),
]).transform((val) => {
  if (val instanceof Date) return val;
  return new Date(val);
});

export const FormSchema = z.object({
  software: z.string().min(1, { message: empty_field_error_message }),
  version: z.string().min(1, { message: empty_field_error_message }),
  administrative_data: z.object({
    core_issuer: z.string().min(1, { message: empty_field_error_message }),
    country_code: z.string().min(1, { message: empty_field_error_message }),
    used_languages: z.array(
      z.object({
        value: z.string().min(1, { message: empty_field_error_message }),
      })
    ).min(1, { message: empty_field_error_message }),
    mandatory_languages: z.array(
      z.object({
        value: z.string().min(1, { message: empty_field_error_message }),
      })
    ).min(1, { message: empty_field_error_message }),
    sertifikat: z.string().min(1, { message: empty_field_error_message }),
    order: z.string().min(1, { message: empty_field_error_message }),
    tempat: z.string().min(1, { message: empty_field_error_message }),
    tempat_pdf: z.string().min(1, { message: empty_field_error_message }),
  }),
  Measurement_TimeLine: z.object({
    tgl_mulai: dateField,
    tgl_akhir: dateField,
    tgl_pengesahan: dateField,
  }),
  objects: z.array(
    z.object({
      jenis: z.record(z.string()).refine(obj => Object.keys(obj).length > 0, {
        message: empty_field_error_message,
      }),
      merek: z.string().min(1, { message: empty_field_error_message }),
      tipe: z.string().min(1, { message: empty_field_error_message }),
      item_issuer: z.string().min(1, { message: empty_field_error_message }),
      seri_item: z.string().min(1, { message: empty_field_error_message }),
      id_lain: z.record(z.string()).refine(obj => Object.keys(obj).length > 0, {
        message: empty_field_error_message,
      }),
    })
  ).min(1, { message: empty_field_error_message }),
  responsible_persons: z.object({
    pelaksana: z.array(
      z.object({
        nama_resp: z.string().min(1, { message: empty_field_error_message }),
        nip: z.string().min(1, { message: empty_field_error_message }),
        peran: z.string().min(1, { message: empty_field_error_message }),
        main_signer: z.boolean(),
        signature: z.boolean(),
        timestamp: z.boolean(),
      })
    ).min(1, { message: empty_field_error_message }),
    penyelia: z.array(
      z.object({
        nama_resp: z.string().min(1, { message: empty_field_error_message }),
        nip: z.string().min(1, { message: empty_field_error_message }),
        peran: z.string().min(1, { message: empty_field_error_message }),
        main_signer: z.boolean(),
        signature: z.boolean(),
        timestamp: z.boolean(),
      })
    ).min(1, { message: empty_field_error_message }),
    kepala: z.object({
      nama_resp: z.string().min(1, { message: empty_field_error_message }),
      nip: z.string().min(1, { message: empty_field_error_message }),
      peran: z.string().min(1, { message: empty_field_error_message }),
      main_signer: z.boolean(),
      signature: z.boolean(),
      timestamp: z.boolean(),
    }),
    direktur: z.object({
      nama_resp: z.string().min(1, { message: empty_field_error_message }),
      nip: z.string().min(1, { message: empty_field_error_message }),
      peran: z.string().min(1, { message: empty_field_error_message }),
      main_signer: z.boolean(),
      signature: z.boolean(),
      timestamp: z.boolean(),
    }),
  }),
  owner: z.object({
    nama_cust: z.string().min(1, { message: empty_field_error_message }),
    jalan_cust: z.string().min(1, { message: empty_field_error_message }),
    no_jalan_cust: z.string().min(1, { message: empty_field_error_message }),
    kota_cust: z.string().min(1, { message: empty_field_error_message }),
    state_cust: z.string().min(1, { message: empty_field_error_message }),
    pos_cust: z.string().min(1, { message: empty_field_error_message }),
    negara_cust: z.string().min(1, { message: empty_field_error_message }),
  }),
});

export default function AdministrativeForm({
  formData,
  updateFormData,
  onValidationChange, // Add this prop
}: {
  formData: any;
  updateFormData: (data: any) => void;
  onValidationChange?: (isValid: boolean) => void; // Add this prop
}) {
  // Add validation check effect
  useEffect(() => {
    const validateForm = () => {
      const result = FormSchema.safeParse(formData);
      onValidationChange?.(result.success);
    };

    validateForm();
  }, [formData, onValidationChange]);
  
  const { t } = useLanguage();

  const form = useForm({
    resolver: zodResolver(FormSchema),
    mode: "onBlur",
    defaultValues: formData,
  });

  useEffect(() => {
    if (JSON.stringify(form.getValues()) !== JSON.stringify(formData)) {
      form.reset(formData);
    }
  }, [formData, form]);

  const [selectedPlace, setPlace] = useState<string>(
    form.getValues("administrative_data.tempat") || ""
  );

  // Simple debounced update to prevent infinite loops
  useEffect(() => {
    const subscription = form.watch((data) => {
      // Gunakan debounce yang lebih stabil
      const timeoutId = setTimeout(() => {
        updateFormData(data);
      }, 300); // Waktu lebih lama untuk menghindari update terlalu sering

      return () => clearTimeout(timeoutId);
    });

    return () => subscription.unsubscribe();
  }, [form, updateFormData]);

  const [countries, setCountries] = useState<Country[]>([]);
  useEffect(() => {
    fetchCountries().then(setCountries);
  }, []);

  const [languages, setLanguages] = useState<Language[]>([]);
  useEffect(() => {
    fetchLanguages().then(setLanguages);
  }, []);

  const {
    fields: usedFields,
    append: appendUsed,
    remove: removeUsed,
  } = useFieldArray({
    control: form.control,
    name: "administrative_data.used_languages",
  });

  const {
    fields: mandatoryFields,
    append: appendMandatory,
    remove: removeMandatory,
  } = useFieldArray({
    control: form.control,
    name: "administrative_data.mandatory_languages",
  });

  const {
    fields: itemFields,
    append: appendItem,
    remove: removeItem,
  } = useFieldArray({
    control: form.control,
    name: "objects",
  });

  const {
    fields: pelaksanaFields,
    append: appendPelaksana,
    remove: removePelaksana,
  } = useFieldArray({
    control: form.control,
    name: "responsible_persons.pelaksana",
  });

  const {
    fields: penyeliaFields,
    append: appendPenyelia,
    remove: removePenyelia,
  } = useFieldArray({
    control: form.control,
    name: "responsible_persons.penyelia",
  });

  const {
    fields: kepalaFields,
    append: appendKepala,
    remove: removeKepala,
  } = useFieldArray({
    control: form.control,
    name: "responsible_persons.kepala",
  });

  const {
    fields: direkturFields,
    append: appendDirektur,
    remove: removeDirektur,
  } = useFieldArray({
    control: form.control,
    name: "responsible_persons.direktur",
  });

  // Initial state untuk peran pada pelaksana, penyelia, kepala, dan direktur
  const [selectedRoles, setSelectedRoles] = useState(
    pelaksanaFields
      .concat(penyeliaFields, kepalaFields, direkturFields)
      .map(() => "")
  );

  // Mengubah peran yang dipilih pada masing-masing pelaksana atau penyelia
  const handleRoleChange = (index: number, value: string) => {
    setSelectedRoles((prevRoles) => {
      const newRoles = [...prevRoles];
      newRoles[index] = value;
      return newRoles;
    });
  };

  // Use direct watch without memoization - this ensures immediate updates
  const usedLanguages: { value: string }[] =
    form.watch("administrative_data.used_languages") || [];

  // Memoize createMultilangObject untuk mencegah re-creation
  const createMultilangObject = useCallback(
    (usedLanguages: { value: string }[]): Record<string, string> => {
      const result: Record<string, string> = {};
      usedLanguages.forEach((lang) => {
        if (lang.value?.trim()) {
          result[lang.value] = "";
        }
      });
      return result;
    },
    []
  );

  // Fungsi onSubmit
  const onSubmit = async (data: any) => {
    const allResponsiblePersons = [
      ...data.responsible_persons.pelaksana,
      ...data.responsible_persons.penyelia,
      data.responsible_persons.kepala,
      data.responsible_persons.direktur,
    ];

    allResponsiblePersons.forEach((person: any) => {
      if (
        person.peran === "Direktur SNSU Termoelektrik dan Kimia" ||
        person.peran === "Direktur SNSU Mekanika, Radiasi, dan Biologi"
      ) {
        person.main_signer = 1;
        person.signature = 1;
        person.timestamp = 1;
      } else {
        person.main_signer = 0;
        person.signature = 0;
        person.timestamp = 0;
      }
    });

    try {
      const response = await fetch("http://127.0.0.1:8000/create-dcc/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
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

  const updateFormDataCallback = useCallback((data: any) => {
    updateFormData(data);
  }, [updateFormData]);

  // Filter languages that have values for rendering
  const validLanguages = useMemo(() => {
    return usedLanguages.filter((lang) => lang.value && lang.value.trim());
  }, [usedLanguages]);

  // Memoize handlers untuk mencegah re-creation
  const handleAppendUsed = useCallback(() => {
    appendUsed({ value: "" });
  }, [appendUsed]);

  const handleRemoveUsed = useCallback((index: number) => {
    removeUsed(index);
  }, [removeUsed]);

  const handleAppendItem = useCallback(() => {
    const currentLanguages = validLanguages;
    const newItem = {
      jenis: createMultilangObject(currentLanguages),
      merek: "",
      tipe: "",
      item_issuer: "",
      seri_item: "",
      id_lain: createMultilangObject(currentLanguages),
    };
    appendItem(newItem);
  }, [appendItem, createMultilangObject, validLanguages]);

  const handleRemoveItem = useCallback(
    (index: number) => {
      removeItem(index);
    },
    [removeItem]
  );

  return (
    <FormProvider {...form}>
      <form
        onSubmit={(e) => {
          console.log("Form submitted!");
          form.handleSubmit(onSubmit)(e);
        }}
        className="space-y-16 max-w-4xl mx-auto p-4"
      >
        <Card id="software">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderCode className="w-5 h-5" />
              {t("software")}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid grid-row md:grid-cols-2 gap-4">
              <div id="software">
                <FormLabel>{t("nama")}</FormLabel>
                <FormField
                  control={form.control}
                  name="software"
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
              <div id="version">
                <FormLabel>{t("versi")}</FormLabel>
                <FormField
                  control={form.control}
                  name="version"
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
          </CardContent>
        </Card>

        {/* ADMINISTRATIVE DATA */}
        <Card id="core-data">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5" />
              {t("data")}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid grid-row md:grid-cols-2 gap-4">
              <div id="country_code">
                <FormLabel>{t("negara_calib")}</FormLabel>
                <FormField
                  control={form.control}
                  name="administrative_data.country_code"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value
                                ? countries.find(
                                    (country) => country.value === field.value
                                  )?.label
                                : ""}
                              <ChevronsUpDown className="opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                          <Command>
                            <CommandInput
                              placeholder={`${t("cari_negara")}`}
                              className="h-9"
                            />
                            <CommandList>
                              <CommandGroup>
                                {countries.map((country) => (
                                  <CommandItem
                                    value={country.label}
                                    key={country.value}
                                    onSelect={() => {
                                      form.setValue(
                                        "administrative_data.country_code",
                                        country.value
                                      );
                                    }}
                                  >
                                    {country.label}
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

              <div id="tempat">
                <FormLabel>{t("tempat")}</FormLabel>
                <FormField
                  control={form.control}
                  name="administrative_data.tempat"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          setPlace(value); // Set local selectedPlace state
                          field.onChange(value); // Update the form field value

                          if (value === "laboratory") {
                            form.setValue(
                              "administrative_data.tempat_pdf",
                              "Laboratorium SNSU-BSN"
                            );
                          } else {
                            form.setValue("administrative_data.tempat_pdf", "");
                          }
                        }}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="laboratory">laboratory</SelectItem>
                          <SelectItem value="customer">customer</SelectItem>
                          <SelectItem value="laboratoryBranch">
                            laboratoryBranch
                          </SelectItem>
                          <SelectItem value="customerBranch">
                            customerBranch
                          </SelectItem>
                          <SelectItem value="other">{t("other")}</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Display input only when 'other' is selected */}
                      {selectedPlace && selectedPlace !== "laboratory" && (
                        <Input
                          value={form.getValues(
                            "administrative_data.tempat_pdf"
                          )} // Bind input value to form state
                          onChange={(e) => {
                            form.setValue(
                              "administrative_data.tempat_pdf",
                              e.target.value
                            ); // Update form value on input change
                          }}
                        />
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Languages Group */}
            <div className="grid grid-row md:grid-cols-2 gap-4">
              <div id="used_language">
                <FormLabel>{t("used")}</FormLabel>
                <div className="space-y-2">
                  {usedFields.map((field, index) => (
                    <FormField
                      key={field.id}
                      control={form.control}
                      name={`administrative_data.used_languages.${index}.value`}
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                      "w-full justify-between",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value
                                      ? languages.find(
                                          (lang) => lang.value === field.value
                                        )?.label
                                      : ""}
                                    <ChevronsUpDown className="opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-full p-0">
                                <Command>
                                  <CommandInput
                                    placeholder={`${t("cari_bahasa")}`}
                                    className="h-9"
                                  />
                                  <CommandList>
                                    <CommandGroup>
                                      {languages.map((lang) => (
                                        <CommandItem
                                          key={lang.value}
                                          onSelect={() =>
                                            form.setValue(
                                              `administrative_data.used_languages.${index}.value`,
                                              lang.value
                                            )
                                          }
                                        >
                                          {lang.label}
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                            {usedFields.length > 1 && (
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                onClick={() => handleRemoveUsed(index)}
                              >
                                <X />
                              </Button>
                            )}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2 w-10 h-10"
                  onClick={handleAppendUsed}
                >
                  <p className="text-xl">
                    <Plus />
                  </p>
                </Button>
              </div>
              <div id="mandatory_language">
                <FormLabel>{t("mandatory")}</FormLabel>
                <div className="space-y-2">
                  {mandatoryFields.map((field, index) => (
                    <FormField
                      key={field.id}
                      control={form.control}
                      name={`administrative_data.mandatory_languages.${index}.value`}
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                      "w-full justify-between",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value
                                      ? languages.find(
                                          (lang) => lang.value === field.value
                                        )?.label
                                      : ""}
                                    <ChevronsUpDown className="opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-full p-0">
                                <Command>
                                  <CommandInput
                                    placeholder={`${t("cari_bahasa")}`}
                                    className="h-9"
                                  />
                                  <CommandList>
                                    <CommandGroup>
                                      {languages.map((lang) => (
                                        <CommandItem
                                          key={lang.value}
                                          onSelect={() =>
                                            form.setValue(
                                              `administrative_data.mandatory_languages.${index}.value`,
                                              lang.value
                                            )
                                          }
                                        >
                                          {lang.label}
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                            {mandatoryFields.length > 1 && (
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                onClick={() => removeMandatory(index)}
                              >
                                <X />
                              </Button>
                            )}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="mt-2 w-10 h-10"
                  onClick={() => appendMandatory({ value: "" })}
                >
                  <p className="text-xl">
                    <Plus />
                  </p>
                </Button>
              </div>
            </div>

            <div className="grid grid-row md:grid-cols-2 gap-4">
              <div id="order">
                <FormLabel>{t("order")}</FormLabel>
                <FormField
                  control={form.control}
                  name="administrative_data.order"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div id="core_issuer">
                <FormLabel>{t("penerbit_order")}</FormLabel>
                <FormField
                  control={form.control}
                  name="administrative_data.core_issuer"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        value="calibrationLaboratory"
                        defaultValue="calibrationLaboratory"
                        disabled
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="manufacturer">
                            manufacturer
                          </SelectItem>
                          <SelectItem value="calibrationLaboratory">
                            calibrationLaboratory
                          </SelectItem>
                          <SelectItem value="customer">customer</SelectItem>
                          <SelectItem value="owner">owner</SelectItem>
                          <SelectItem value="other">other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <div id="sertifikat">
              <FormLabel>{t("sertifikat")}</FormLabel>
              <FormField
                control={form.control}
                name="administrative_data.sertifikat"
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
          </CardContent>
        </Card>

        <Card id="tanggal">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              {t("linimasa")}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid grid-row md:grid-cols-2 gap-4">
              <div id="tgl_mulai">
                <FormLabel>{t("mulai")}</FormLabel>
                <FormField
                  control={form.control}
                  name="Measurement_TimeLine.tgl_mulai"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span></span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date: Date | undefined) => {
                              if (date) {
                                const adjustedDate = new Date(date);
                                adjustedDate.setMinutes(
                                  adjustedDate.getMinutes() -
                                    adjustedDate.getTimezoneOffset()
                                );
                                field.onChange(adjustedDate);
                              }
                            }}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div id="tgl_akhir">
                <FormLabel>{t("akhir")}</FormLabel>
                <FormField
                  control={form.control}
                  name="Measurement_TimeLine.tgl_akhir"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span></span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date: Date | undefined) => {
                              if (date) {
                                const adjustedDate = new Date(date);
                                adjustedDate.setMinutes(
                                  adjustedDate.getMinutes() -
                                    adjustedDate.getTimezoneOffset()
                                );
                                field.onChange(adjustedDate);
                              }
                            }}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <div id="tgl_pengesahan">
              <FormLabel>{t("pengesahan")}</FormLabel>
              <FormField
                control={form.control}
                name="Measurement_TimeLine.tgl_pengesahan"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span></span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date: Date | undefined) => {
                            if (date) {
                              const adjustedDate = new Date(date);
                              adjustedDate.setMinutes(
                                adjustedDate.getMinutes() -
                                  adjustedDate.getTimezoneOffset()
                              );
                              field.onChange(adjustedDate);
                            }
                          }}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card id="items">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              {t("object_desc")}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-4">
              {itemFields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid gap-4 border-b pb-4 relative"
                >
                  <CardDescription>
                    {t("objek")} {index + 1}
                  </CardDescription>
                  {itemFields.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-0 right-0"
                      onClick={() => handleRemoveItem(index)}
                    >
                      <X />
                    </Button>
                  )}
                  <div id="jenis">
                    <FormLabel>{t("jenis")}</FormLabel>
                    <div className="space-y-1">
                      {validLanguages.length === 0 ? (
                        <p className="text-sm text-red-600">{t("pilih_bahasa")}</p>
                      ) : (
                        validLanguages.map((lang: { value: string }) => (
                          <FormField
                            control={form.control}
                            key={`objects-${index}-jenis-${lang.value}`} // Key yang lebih spesifik dan stabil
                            name={`objects.${index}.jenis.${lang.value}`}
                            render={({ field: jenisField }) => (
                              <FormItem>
                                <div className="flex items-center gap-2">
                                  <FormControl>
                                    <Input
                                      placeholder={`${t("bahasa")} ${
                                        languages.find((l) => l.value === lang.value)?.label || lang.value
                                      }`}
                                      {...jenisField}
                                      value={jenisField.value || ""}
                                      onChange={(e) => {
                                        // Pastikan onChange tidak memicu re-render yang tidak perlu
                                        jenisField.onChange(e.target.value);
                                      }}
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
                  <div className="grid grid-row md:grid-cols-2 gap-4">
                    <div id="merek">
                      <FormLabel>{t("merek")}</FormLabel>
                      <FormField
                        control={form.control}
                        name={`objects.${index}.merek`}
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
                    <div id="tipe">
                      <FormLabel>{t("tipe")}</FormLabel>
                      <FormField
                        control={form.control}
                        name={`objects.${index}.tipe`}
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

                  <Card id="identifikasi-alat" className="border shadow mt-5">
                    <CardHeader>
                      <CardTitle className="text-black">
                        {t("identifikasi")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                      <div className="grid grid-row md:grid-cols-2 gap-4">
                        <div id="item_issuer">
                          <FormLabel>
                            {t("penerbit_seri")}
                          </FormLabel>
                          <FormField
                            control={form.control}
                            name={`objects.${index}.item_issuer`}
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
                                  <SelectContent>
                                    <SelectItem value="manufacturer">
                                      manufacturer
                                    </SelectItem>
                                    <SelectItem value="calibrationLaboratory">
                                      calibrationLaboratory
                                    </SelectItem>
                                    <SelectItem value="customer">
                                      customer
                                    </SelectItem>
                                    <SelectItem value="owner">owner</SelectItem>
                                    <SelectItem value="other">other</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div id="seri_item">
                          <FormLabel>{t("seri")}</FormLabel>
                          <FormField
                            control={form.control}
                            name={`objects.${index}.seri_item`}
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
                      <div id="id_lain">
                        <FormLabel>{t("id_lain")}</FormLabel>
                        <div className="space-y-1">
                          {validLanguages.length === 0 ? (
                            <p className="text-sm text-red-600">
                              {t("pilih_bahasa")}
                            </p>
                          ) : (
                            validLanguages.map(
                              (lang: { value: string }) => (
                                <FormField
                                  control={form.control}
                                  key={`${field.id}-id_lain-${lang.value}`}
                                  name={`objects.${index}.id_lain.${lang.value}`}
                                  render={({ field: idLainField }) => (
                                    <FormItem>
                                      <div className="flex items-center gap-2">
                                        <FormControl>
                                          <Input
                                            placeholder={`${t("bahasa")} ${
                                              languages.find(
                                                (l) => l.value === lang.value
                                              )?.label || lang.value
                                            }`}
                                            {...idLainField}
                                            value={idLainField.value || ""}
                                          />
                                        </FormControl>
                                      </div>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              )
                            )
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
            <Button
              variant="green"
              type="button"
              size="sm"
              className="mt-4 w-10 h-10 flex items-center justify-center mx-auto"
              onClick={handleAppendItem}
            >
              <p className="text-xl">
                <Plus />
              </p>
            </Button>
          </CardContent>
        </Card>

        <Card id="resp_person">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5" />
              {t("responsible")}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-4">
              <div id="pelaksana" className="grid gap-4 border-b pb-4">
                {pelaksanaFields.map((field, index) => (
                  <div key={field.id} className="relative">
                    <p className="text-sm font-bold">
                      {t("pelaksana")} {index + 1}
                    </p>
                    {pelaksanaFields.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-0 right-0"
                        onClick={() => removePelaksana(index)}
                      >
                        <X />
                      </Button>
                    )}
                    <div className="grid grid-row md:grid-cols-2 gap-4">
                      <div id="nama_resp">
                        <FormLabel>{t("nama")}</FormLabel>
                        <FormField
                          control={form.control}
                          name={`responsible_persons.pelaksana.${index}.nama_resp`}
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
                      <div id="nip">
                        <FormLabel>{t("nip")}</FormLabel>
                        <FormField
                          control={form.control}
                          name={`responsible_persons.pelaksana.${index}.nip`}
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
                ))}
                <Button
                  variant="green"
                  type="button"
                  size="sm"
                  className="mt-4 w-10 h-10 flex items-center justify-center mx-auto"
                  onClick={() =>
                    appendPelaksana({
                      nama_resp: "",
                      nip: "",
                      peran: "Pelaksana Kalibrasi",
                      main_signer: 0,
                      signature: 0,
                      timestamp: 0,
                    })
                  }
                >
                  <p className="text-xl">
                    <Plus />
                  </p>
                </Button>
              </div>
              <div id="penyelia" className="grid gap-4 border-b pb-4">
                {penyeliaFields.map((field, index) => (
                  <div key={field.id} className="relative">
                    <p className="text-sm font-bold">
                      {t("penyelia")} {index + 1}
                    </p>
                    {penyeliaFields.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-0 right-0"
                        onClick={() => removePenyelia(index)}
                      >
                        <X />
                      </Button>
                    )}
                    <div className="grid grid-row md:grid-cols-2 gap-4">
                      <div id="nama_resp">
                        <FormLabel>{t("nama")}</FormLabel>
                        <FormField
                          control={form.control}
                          name={`responsible_persons.penyelia.${index}.nama_resp`}
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
                      <div id="nip">
                        <FormLabel>{t("nip")}</FormLabel>
                        <FormField
                          control={form.control}
                          name={`responsible_persons.penyelia.${index}.nip`}
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
                ))}
                <Button
                  variant="green"
                  type="button"
                  size="sm"
                  className="mt-4 w-10 h-10 flex items-center justify-center mx-auto"
                  onClick={() =>
                    appendPenyelia({
                      nama_resp: "",
                      nip: "",
                      peran: "Penyelia Kalibrasi",
                      main_signer: 0,
                      signature: 0,
                      timestamp: 0,
                    })
                  }
                >
                  <p className="text-xl">
                    <Plus />
                  </p>
                </Button>
              </div>
              <div id="kepala" className="grid gap-4 border-b pb-4 relative">
                <p className="text-sm font-bold">{t("kepala")}</p>
                <div className="grid grid-row md:grid-cols-2 gap-4">
                  <div id="nama_resp">
                    <FormLabel>{t("nama")}</FormLabel>
                    <FormField
                      control={form.control}
                      name="responsible_persons.kepala.nama_resp"
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
                  <div id="nip">
                    <FormLabel>{t("nip")}</FormLabel>
                    <FormField
                      control={form.control}
                      name="responsible_persons.kepala.nip"
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
                <div id="lab">
                  <FormLabel>{t("lab")}</FormLabel>
                  <FormField
                    control={form.control}
                    name="responsible_persons.kepala.peran"
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
                          <SelectContent>
                            <SelectItem value="Kepala Laboratorium SNSU Suhu">
                              SNSU Suhu
                            </SelectItem>
                            <SelectItem value="Kepala Laboratorium SNSU Kelistrikan">
                              SNSU Kelistrikan
                            </SelectItem>
                            <SelectItem value="Kepala Laboratorium SNSU Waktu & Frekuensi">
                              SNSU Waktu & Frekuensi
                            </SelectItem>
                            <SelectItem value="Kepala Laboratorium SNSU Fotometri & Radiometri">
                              SNSU Fotometri & Radiometri
                            </SelectItem>
                            <SelectItem value="Kepala Laboratorium SNSU Kimia">
                              SNSU Kimia
                            </SelectItem>
                            <SelectItem value="Kepala Laboratorium SNSU Panjang">
                              SNSU Panjang
                            </SelectItem>
                            <SelectItem value="Kepala Laboratorium SNSU Massa">
                              SNSU Massa
                            </SelectItem>
                            <SelectItem value="Kepala Laboratorium SNSU Akustik & Vibrasi">
                              SNSU Akustik & Vibrasi
                            </SelectItem>
                            <SelectItem value="Kepala Laboratorium SNSU Biologi">
                              SNSU Biologi
                            </SelectItem>
                            <SelectItem value="Kepala Laboratorium SNSU Radiasi Ringan">
                              SNSU Radiasi Ringan
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div id="direktur" className="grid gap-4 pb-4 relative">
                <p className="text-sm font-bold">{t("direktur")}</p>
                <div className="grid grid-row md:grid-cols-2 gap-4">
                  <div id="nama_resp">
                    <FormLabel>{t("nama")}</FormLabel>
                    <FormField
                      control={form.control}
                      name="responsible_persons.direktur.nama_resp"
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
                  <div id="nip">
                    <FormLabel>{t("nip")}</FormLabel>
                    <FormField
                      control={form.control}
                      name="responsible_persons.direktur.nip"
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
                <div id="jabatan">
                  <FormLabel>{t("jabatan")}</FormLabel>
                  <FormField
                    control={form.control}
                    name="responsible_persons.direktur.peran"
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
                          <SelectContent>
                            <SelectItem value="Direktur SNSU Termoelektrik dan Kimia">
                              Direktur SNSU Termoelektrik dan Kimia
                            </SelectItem>
                            <SelectItem value="Direktur SNSU Mekanika, Radiasi, dan Biologi">
                              Direktur SNSU Mekanika, Radiasi, dan Biologi
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card id="customer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileUser className="w-5 h-5" />
              {t("identitas")}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-4">
              <div id="nama_cust">
                <FormLabel>{t("nama")}</FormLabel>
                <FormField
                  control={form.control}
                  name="owner.nama_cust"
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

              <Card id="alamat" className="border shadow mt-5">
                <CardHeader>
                  <CardTitle className="text-black">{t("alamat")}</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6">
                  <div className="grid grid-row md:grid-cols-2 gap-4">
                    <div id="jalan_cust">
                      <FormLabel>{t("jalan")}</FormLabel>
                      <FormField
                        control={form.control}
                        name="owner.jalan_cust"
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
                    <div id="no_jalan_cust">
                      <FormLabel>{t("no_jalan")}</FormLabel>
                      <FormField
                        control={form.control}
                        name="owner.no_jalan_cust"
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
                    <div id="kota_cust">
                      <FormLabel>{t("kota")}</FormLabel>
                      <FormField
                        control={form.control}
                        name="owner.kota_cust"
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
                    <div id="state_cust">
                      <FormLabel>{t("provinsi")}</FormLabel>
                      <FormField
                        control={form.control}
                        name="owner.state_cust"
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
                    <div id="pos_cust">
                      <FormLabel>{t("pos")}</FormLabel>
                      <FormField
                        control={form.control}
                        name="owner.pos_cust"
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
                    <div id="negara_cust">
                      <FormLabel>{t("negara_cust")}</FormLabel>
                      <FormField
                        control={form.control}
                        name="owner.negara_cust"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                      "w-full justify-between",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value
                                      ? countries.find(
                                          (country) =>
                                            country.value === field.value
                                        )?.label
                                      : ""}
                                    <ChevronsUpDown className="opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                                <Command>
                                  <CommandInput
                                    placeholder={`${t("cari_negara")}`}
                                    className="h-9"
                                  />
                                  <CommandList>
                                    <CommandGroup>
                                      {countries.map((country) => (
                                        <CommandItem
                                          value={country.label}
                                          key={country.value}
                                          onSelect={() => {
                                            form.setValue(
                                              "owner.negara_cust",
                                              country.value
                                            );
                                          }}
                                        >
                                          {country.label}
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
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </form>
    </FormProvider>
  );
}
