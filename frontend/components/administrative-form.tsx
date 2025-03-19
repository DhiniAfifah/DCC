import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronsUpDown, CalendarIcon } from "lucide-react";
import { useFieldArray, useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";
import axios from "axios";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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

type Country = { label: string; value: string };
const fetchCountries = async (): Promise<Country[]> => {
  try {
    const response = await axios.get("https://restcountries.com/v3.1/all");

    return response.data
      .map((country: any) => ({
        label: country.name.common, // Get country name
        value: country.cca2, // Use country ISO2 code
      }))
      .sort((a: Country, b: Country) => a.label.localeCompare(b.label)); // Sort alphabetically
  } catch (error) {
    console.error("Error fetching countries:", error);
    return [];
  }
};

type Language = { label: string; value: string };
const fetchLanguages = async (): Promise<Language[]> => {
  let allLanguages: Language[] = [];
  let start = 0;
  const limit = 100; // Max rows per request
  let hasMore = true;

  while (hasMore) {
    try {
      const response = await axios.get(
        "https://public.opendatasoft.com/api/records/1.0/search/",
        {
          params: {
            dataset: "iso-language-codes-639-1-and-639-2",
            rows: limit,
            start,
          },
        }
      );

      const languages = response.data.records.map((rec: any) => ({
        label: rec.fields.english,
        value: rec.fields.alpha2,
      }));

      allLanguages = [
        ...allLanguages,
        ...languages.filter((c: Country) => c.label && c.value),
      ];

      start += limit;
      hasMore = response.data.records.length === limit; // Stop when fewer than `limit` results are returned
    } catch (error) {
      console.error("Error fetching countries:", error);
      return allLanguages.sort((a, b) => a.label.localeCompare(b.label)); // Sort before returning
    }
  }

  return allLanguages.sort((a, b) => a.label.localeCompare(b.label)); // Sort alphabetically
};

const empty_field_error_message = "Input diperlukan.";
const FormSchema = z.object({
  software: z.string().min(1, { message: empty_field_error_message }),
  version: z.string().min(1, { message: empty_field_error_message }),
  core_issuer: z.string({ required_error: empty_field_error_message }),
  country_code: z.string({ required_error: empty_field_error_message }),
  used_languages: z.array(
    z.object({
      value: z.string().min(1, empty_field_error_message),
    })
  ),
  mandatory_languages: z.array(
    z.object({
      value: z.string().min(1, empty_field_error_message),
    })
  ),
  sertifikat: z.string().min(1, { message: empty_field_error_message }),
  order: z.string().min(1, { message: empty_field_error_message }),
  tgl_mulai: z.date({ required_error: empty_field_error_message }),
  tgl_akhir: z.date({ required_error: empty_field_error_message }),
  tempat: z.string({ required_error: empty_field_error_message }),
  tgl_pengesahan: z.date({ required_error: empty_field_error_message }),
  objects: z.array(
    z.object({
      jenis: z.string().min(1, { message: empty_field_error_message }),
      merek: z.string().min(1, { message: empty_field_error_message }),
      tipe: z.string().min(1, { message: empty_field_error_message }),
      item_issuer: z.string().min(1, { message: empty_field_error_message }),
      seri_item: z.string().min(1, { message: empty_field_error_message }),
      id_lain: z.string().min(1, { message: empty_field_error_message }),
    })
  ),
  responsible_persons: z.array(
    z.object({
      nama_resp: z.string().min(1, { message: empty_field_error_message }),
      nip: z.string().min(1, { message: empty_field_error_message }),
      peran: z.string().min(1, { message: empty_field_error_message }),
      main_signer: z.string().min(1, { message: empty_field_error_message }),
      signature: z.string().min(1, { message: empty_field_error_message }),
      timestamp: z.string().min(1, { message: empty_field_error_message }),
    })
  ),
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
}: {
  formData: any;
  updateFormData: (data: any) => void;
}) {
  const form = useForm({
    resolver: zodResolver(FormSchema),
    mode: "onChange",
    defaultValues: formData,
  });

  useEffect(() => {
    const subscription = form.watch((values) => {
      updateFormData(values);
    });

    return () => subscription.unsubscribe();
  }, [form.watch]);

  const [countries, setCountries] = useState<Country[]>([]);
  useEffect(() => {
    fetchCountries().then(setCountries);
  }, []);

  const [languages, setLanguages] = useState<Country[]>([]);
  useEffect(() => {
    fetchLanguages().then(setLanguages);
  }, []);

  const {
    fields: usedFields,
    append: appendUsed,
    remove: removeUsed,
  } = useFieldArray({
    control: form.control,
    name: "used_languages",
  });

  const {
    fields: mandatoryFields,
    append: appendMandatory,
    remove: removeMandatory,
  } = useFieldArray({
    control: form.control,
    name: "mandatory_languages",
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
    fields: personFields,
    append: appendPerson,
    remove: removePerson,
  } = useFieldArray({
    control: form.control,
    name: "responsible_persons",
  });

  const [selectedRoles, setSelectedRoles] = useState(
    personFields.map(() => "")
  );
  
  const handleRoleChange = (index: number, value: string) => {
    setSelectedRoles((prevRoles) => {
      const newRoles = [...prevRoles];
      newRoles[index] = value;
      return newRoles;
    });
  };

  const onSubmit = async (data: any) => {
    // Loop untuk setiap orang yang bertanggung jawab
    data.responsible_persons.forEach((person: any) => {
      // Cek jika peran orang tersebut adalah "Direktur SNSU Termoelektrik dan Kimia" atau "Direktur SNSU Mekanika, Radiasi, dan Biologi"
      if (
        person.peran === "Direktur SNSU Termoelektrik dan Kimia" || // Direktur SNSU Termoelektrik dan Kimia
        person.peran === "Direktur SNSU Mekanika, Radiasi, dan Biologi" // Direktur SNSU Mekanika, Radiasi, dan Biologi
      ) {
        // Set Main Signer, Signature, dan Timestamp ke true
        person.main_signer = "true";
        person.signature = "true";
        person.timestamp = "true";
      } else {
        // Set Main Signer, Signature, dan Timestamp ke false untuk peran lainnya
        person.main_signer = "false";
        person.signature = "false";
        person.timestamp = "false";
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

  return (
    <FormProvider {...form}>
      <form
        onSubmit={(e) => {
          console.log("Form submitted!");
          form.handleSubmit(onSubmit)(e);
        }}
        className="space-y-6 max-w-4xl mx-auto p-4"
      >
        <Card id="software">
          <CardHeader>
            <CardTitle>Software</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid grid-cols-2 gap-4">
              <div id="software">
                <FormLabel>Nama</FormLabel>
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
                <FormLabel>Versi</FormLabel>
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

        <Card id="core-data">
          <CardHeader>
            <CardTitle>Data Inti</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid grid-cols-2 gap-4">
              <div id="core_issuer">
                <FormLabel>Penerbit</FormLabel>
                <FormField
                  control={form.control}
                  name="core_issuer"
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
              <div id="tempat">
                <FormLabel>Tempat Kalibrasi</FormLabel>
                <FormField
                  control={form.control}
                  name="tempat"
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
                          <SelectItem value="laboratory">laboratory</SelectItem>
                          <SelectItem value="customer">customer</SelectItem>
                          <SelectItem value="laboratoryBranch">
                            laboratoryBranch
                          </SelectItem>
                          <SelectItem value="customerBranch">
                            customerBranch
                          </SelectItem>
                          <SelectItem value="other">other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div id="tgl_pengesahan">
                <FormLabel>Tanggal Pengesahan</FormLabel>
                <FormField
                  control={form.control}
                  name="tgl_pengesahan"
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
                            onSelect={field.onChange}
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
              <div id="country_code">
                <FormLabel>Kode Negara</FormLabel>
                <FormField
                  control={form.control}
                  name="country_code"
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
                              placeholder="Cari negara..."
                              className="h-9"
                            />
                            <CommandList>
                              <CommandEmpty>Sedang memuat...</CommandEmpty>
                              <CommandGroup>
                                {countries.map((country) => (
                                  <CommandItem
                                    value={country.label}
                                    key={country.value}
                                    onSelect={() => {
                                      form.setValue(
                                        "country_code",
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
            <div className="grid grid-cols-2 gap-4">
              <div id="used_language">
                <FormLabel>Bahasa yang Digunakan</FormLabel>
                <div className="space-y-2">
                  {usedFields.map((field, index) => (
                    <FormField
                      key={field.id}
                      control={form.control}
                      name={`used_languages.${index}.value`}
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
                                    placeholder="Cari bahasa..."
                                    className="h-9"
                                  />
                                  <CommandList>
                                    <CommandEmpty>
                                      Bahasa tidak ditemukan.
                                    </CommandEmpty>
                                    <CommandGroup>
                                      {languages.map((lang) => (
                                        <CommandItem
                                          key={lang.value}
                                          onSelect={() =>
                                            form.setValue(
                                              `used_languages.${index}.value`,
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
                                onClick={() => removeUsed(index)}
                              >
                                ✕
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
                  className="mt-2"
                  onClick={() => appendUsed({ value: "" })}
                >
                  <p className="text-xl">+</p>
                </Button>
              </div>
              <div id="mandatory_language">
                <FormLabel>Bahasa Wajib</FormLabel>
                <div className="space-y-2">
                  {mandatoryFields.map((field, index) => (
                    <FormField
                      key={field.id}
                      control={form.control}
                      name={`mandatory_languages.${index}.value`}
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
                                    placeholder="Cari bahasa..."
                                    className="h-9"
                                  />
                                  <CommandList>
                                    <CommandEmpty>
                                      Bahasa tidak ditemukan.
                                    </CommandEmpty>
                                    <CommandGroup>
                                      {languages.map((lang) => (
                                        <CommandItem
                                          key={lang.value}
                                          onSelect={() =>
                                            form.setValue(
                                              `mandatory_languages.${index}.value`,
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
                                ✕
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
                  className="mt-2"
                  onClick={() => appendMandatory({ value: "" })}
                >
                  <p className="text-xl">+</p>
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div id="sertifikat">
                <FormLabel>Nomor Sertifikat</FormLabel>
                <FormField
                  control={form.control}
                  name="sertifikat"
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
              <div id="order">
                <FormLabel>Nomor Order</FormLabel>
                <FormField
                  control={form.control}
                  name="order"
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
            <div className="grid grid-cols-2 gap-4">
              <div id="tgl_mulai">
                <FormLabel>Tanggal Mulai Pengukuran</FormLabel>
                <FormField
                  control={form.control}
                  name="tgl_mulai"
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
                            onSelect={field.onChange}
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
                <FormLabel>Tanggal Akhir Pengukuran</FormLabel>
                <FormField
                  control={form.control}
                  name="tgl_akhir"
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
                            onSelect={field.onChange}
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
          </CardContent>
        </Card>

        <Card id="items">
          <CardHeader>
            <CardTitle>Deskripsi Objek yang Dikalibrasi/Diukur</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-4">
              {itemFields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid gap-4 border-b pb-4 relative"
                >
                  <p className="text-sm text-muted-foreground">
                    Objek {index + 1}
                  </p>
                  {itemFields.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-0 right-0"
                      onClick={() => removeItem(index)}
                    >
                      ✕
                    </Button>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div id="jenis">
                      <FormLabel>Jenis Alat atau Objek</FormLabel>
                      <FormField
                        control={form.control}
                        name={`objects.${index}.jenis`}
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
                    <div id="merek">
                      <FormLabel>Merek/Pembuat</FormLabel>
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
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div id="tipe">
                      <FormLabel>Tipe</FormLabel>
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
                    <div id="item_issuer">
                      <FormLabel>Identifikasi Alat</FormLabel>
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
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div id="seri_item">
                      <FormLabel>Nomor Seri</FormLabel>
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
                    <div id="id_lain">
                      <FormLabel>Identifikasi Lain</FormLabel>
                      <FormField
                        control={form.control}
                        name={`objects.${index}.id_lain`}
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
            </div>
            <Button
              type="button"
              size="sm"
              className="mt-4 w-10 h-10 flex items-center justify-center mx-auto"
              onClick={() =>
                appendItem({
                  jenis: "",
                  merek: "",
                  tipe: "",
                  item_issuer: "",
                  seri_item: "",
                  id_lain: "",
                })
              }
            >
              <p className="text-xl">+</p>
            </Button>
          </CardContent>
        </Card>

        <Card id="resp_person">
          <CardHeader>
            <CardTitle>Penanggung Jawab</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-4">
              <div id="pelaksana" className="grid gap-4 border-b pb-4 relative">
                <p className="text-sm font-bold">
                  Pelaksana Kalibrasi
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div id="nama_resp">
                    <FormLabel>Nama</FormLabel>
                    <FormField
                      control={form.control}
                      name="nama_resp"
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
                    <FormLabel>NIP</FormLabel>
                    <FormField
                      control={form.control}
                      name="nip"
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
              <div id="penyelia" className="grid gap-4 border-b pb-4 relative">
                <p className="text-sm font-bold">
                  Penyelia Kalibrasi
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div id="nama_resp">
                    <FormLabel>Nama</FormLabel>
                    <FormField
                      control={form.control}
                      name="nama_resp"
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
                    <FormLabel>NIP</FormLabel>
                    <FormField
                      control={form.control}
                      name="nip"
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
              <div id="kepala" className="grid gap-4 border-b pb-4 relative">
                <p className="text-sm font-bold">
                  Kepala Laboratorium
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div id="nama_resp">
                    <FormLabel>Nama</FormLabel>
                    <FormField
                      control={form.control}
                      name="nama_resp"
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
                    <FormLabel>NIP</FormLabel>
                    <FormField
                      control={form.control}
                      name="nip"
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
                  <FormLabel>Laboratorium</FormLabel>
                  <FormField
                    control={form.control}
                    name="lab"
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
                            <SelectItem value="SNSU Suhu">SNSU Suhu</SelectItem>
                            <SelectItem value="SNSU Kelistrikan">SNSU Kelistrikan</SelectItem>
                            <SelectItem value="SNSU Waktu & Frekuensi">SNSU Waktu & Frekuensi</SelectItem>
                            <SelectItem value="SNSU Fotometri & Radiometri">SNSU Fotometri & Radiometri</SelectItem>
                            <SelectItem value="SNSU Kimia">SNSU Kimia</SelectItem>
                            <SelectItem value="SNSU Panjang">SNSU Panjang</SelectItem>
                            <SelectItem value="SNSU Massa">SNSU Massa</SelectItem>
                            <SelectItem value="SNSU Akustik & Vibrasi">SNSU Akustik & Vibrasi</SelectItem>
                            <SelectItem value="SNSU Biologi">SNSU Biologi</SelectItem>
                            <SelectItem value="SNSU Radiasi Ringan">SNSU Radiasi Ringan</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div id="direktur" className="grid gap-4 pb-4 relative">
                <p className="text-sm font-bold">
                  Direktur
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div id="nama_resp">
                    <FormLabel>Nama</FormLabel>
                    <FormField
                      control={form.control}
                      name="nama_resp"
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
                    <FormLabel>NIP</FormLabel>
                    <FormField
                      control={form.control}
                      name="nip"
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
                  <FormLabel>Jabatan</FormLabel>
                  <FormField
                    control={form.control}
                    name="jabatan"
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
                            <SelectItem value="Direktur SNSU Termoelektrik dan Kimia">Direktur SNSU Termoelektrik dan Kimia</SelectItem>
                            <SelectItem value="Direktur SNSU Mekanika, Radiasi, dan Biologi">Direktur SNSU Mekanika, Radiasi, dan Biologi</SelectItem>
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
            <CardTitle>Identitas Pemilik</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-4">
              <div id="nama_cust">
                <FormLabel>Nama</FormLabel>
                <FormField
                  control={form.control}
                  name={`owner.nama_cust`}
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
              <div className="grid grid-cols-2 gap-4">
                <div id="jalan_cust">
                  <FormLabel>Jalan</FormLabel>
                  <FormField
                    control={form.control}
                    name={`owner.jalan_cust`}
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
                  <FormLabel>Nomor Jalan</FormLabel>
                  <FormField
                    control={form.control}
                    name={`owner.no_jalan_cust`}
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
              <div className="grid grid-cols-2 gap-4">
                <div id="kota_cust">
                  <FormLabel>Kota</FormLabel>
                  <FormField
                    control={form.control}
                    name={`owner.kota_cust`}
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
                  <FormLabel>Provinsi</FormLabel>
                  <FormField
                    control={form.control}
                    name={`owner.state_cust`}
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
              <div className="grid grid-cols-2 gap-4">
                <div id="pos_cust">
                  <FormLabel>Kode Pos</FormLabel>
                  <FormField
                    control={form.control}
                    name={`owner.pos_cust`}
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
                  <FormLabel>Negara</FormLabel>
                  <FormField
                    control={form.control}
                    name={`owner.negara_cust`}
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
          </CardContent>
        </Card>
      </form>
    </FormProvider>
  );
}
