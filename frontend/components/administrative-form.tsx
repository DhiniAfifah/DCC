import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronsUpDown } from "lucide-react";
import { useFieldArray, useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"

const countries = [
  { label: "Indonesia", value: "id" },
  { label: "United States", value: "us" },
  { label: "United Kingdom", value: "uk" },
  { label: "Germany", value: "de" },
  { label: "France", value: "fr" },
  { label: "Japan", value: "jp" },
  { label: "China", value: "cn" },
] as const;

const languages = [
  { label: "Bahasa Indonesia", value: "id" },
  { label: "English", value: "en" },
  { label: "Mandarin", value: "zh" },
  { label: "French", value: "fr" },
  { label: "German", value: "de" },
  { label: "Japanese", value: "jp" },
] as const;

const empty_field_error_message = 'Input diperlukan.'

const FormSchema = z.object({
  software: z.string().min(1, {message: empty_field_error_message,}),
  version: z.string().min(1, {message: empty_field_error_message,}),
  core_issuer: z.string().min(1, {message: empty_field_error_message,}),
  country_code: z.string().min(1, {message: empty_field_error_message,}),
  used_languages: z.array(z.object({ value: z.string().min(1, empty_field_error_message) })),
  mandatory_languages: z.array(z.object({ value: z.string().min(1, empty_field_error_message) })),
  sertifikat: z.string().min(1, {message: empty_field_error_message,}),
  order: z.string().min(1, {message: empty_field_error_message,}),
  tgl_mulai: z.date({required_error: empty_field_error_message,}),
  tgl_akhir: z.date({required_error: empty_field_error_message,}),
  tempat: z.string().min(1, {message: empty_field_error_message,}),
  tgl_pengesahan: z.date({required_error: empty_field_error_message,}),
  objects: z.array(z.object({
    jenis: z.string().min(1, {message: empty_field_error_message,}),
    merek: z.string().min(1, {message: empty_field_error_message,}),
    tipe: z.string().min(1, {message: empty_field_error_message,}),
    item_issuer: z.string().min(1, {message: empty_field_error_message,}),
    seri_item: z.string().min(1, {message: empty_field_error_message,}),
    id_lain: z.string().min(1, {message: empty_field_error_message,}),
  })),
  responsible_persons: z.array(z.object({
    nama_resp: z.string().min(1, {message: empty_field_error_message,}),
    nip: z.string().min(1, {message: empty_field_error_message,}),
    peran: z.string().min(1, {message: empty_field_error_message,}),
    main_signer: z.string().min(1, {message: empty_field_error_message,}),
    signature: z.string().min(1, {message: empty_field_error_message,}),
    timestamp: z.string().min(1, {message: empty_field_error_message,}),
  })),
  owner: z.object({
    nama_cust: z.string().min(1, {message: empty_field_error_message,}),
    jalan_cust: z.string().min(1, {message: empty_field_error_message,}),
    no_jalan_cust: z.string().min(1, {message: empty_field_error_message,}),
    kota_cust: z.string().min(1, {message: empty_field_error_message,}),
    state_cust: z.string().min(1, {message: empty_field_error_message,}),
    pos_cust: z.string().min(1, {message: empty_field_error_message,}),
    negara_cust: z.string().min(1, {message: empty_field_error_message,}),
  }),
  statements: z.array(z.object({ value: z.string().min(1, empty_field_error_message) })),
});

export default function AdministrativeForm({updateFormData}: {updateFormData: (data: any) => void;}) {
  const form = useForm({
    resolver: zodResolver(FormSchema),
    mode: "onChange",
    defaultValues: {
      software: "",
      version: "",
      core_issuer: "",
      country_code: "",
      used_languages: [{ value: "" }],
      mandatory_languages: [{ value: "" }],
      sertifikat: "",
      order: "",
      tempat: "",
      objects: [{ jenis: "", merek: "", tipe: "", item_issuer: "", seri_item: "", id_lain: "" }],
      responsible_persons: [{ nama_resp: "", nip: "", peran: "", main_signer: "", signature: "", timestamp: "" }],
      owner: { nama_cust: "", jalan_cust: "", no_jalan_cust: "", kota_cust: "", state_cust: "", pos_cust: "", negara_cust: "" },
      statements: [{ value: "" }],
    },
  });

  useEffect(() => {
    const subscription = form.watch((values) => {
      updateFormData(values);
    });

    return () => subscription.unsubscribe();
  }, [form.watch]);

  const {fields: statementFields, append: appendStatement, remove: removeStatement,} = useFieldArray({
    control: form.control,
    name: "statements",
  });

  const {fields: usedFields, append: appendUsed, remove: removeUsed,} = useFieldArray({
    control: form.control,
    name: "used_languages",
  });

  const {fields: mandatoryFields, append: appendMandatory, remove: removeMandatory,} = useFieldArray({
    control: form.control,
    name: "mandatory_languages",
  });

  const { fields: itemFields, append: appendItem, remove: removeItem } = useFieldArray({
    control: form.control,
    name: "objects",
  });

  const { fields: personFields, append: appendPerson, remove: removePerson } = useFieldArray({
    control: form.control,
    name: "responsible_persons",
  });

  const onSubmit = async (data: any) => {
    try {
      // const formattedData = {
      //   ...data,
      //   statements: data.statements.map((s: { value: string }) => s.value), // Convert objects to strings
      // };

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
          <CardHeader><CardTitle>Software</CardTitle></CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid grid-cols-2 gap-4">
              <div id="software">
                <FormLabel>Nama</FormLabel>
                <FormField control={form.control} name="software" render={({ field }) => (
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
                <FormField control={form.control} name="version" render={({ field }) => (
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
          <CardHeader><CardTitle>Data Inti</CardTitle></CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid grid-cols-2 gap-4">
              <div id="core_issuer">
                <FormLabel>Penerbit</FormLabel>
                <FormField control={form.control} name="core_issuer" render={({ field }) => (
                    <FormItem>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="manufacturer">manufacturer</SelectItem>
                          <SelectItem value="calibrationLaboratory">calibrationLaboratory</SelectItem>
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
                <FormField control={form.control} name="tempat" render={({ field }) => (
                    <FormItem>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="laboratory">laboratory</SelectItem>
                          <SelectItem value="customer">customer</SelectItem>
                          <SelectItem value="laboratoryBranch">laboratoryBranch</SelectItem>
                          <SelectItem value="customerBranch">customerBranch</SelectItem>
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
                <FormField control={form.control} name="tgl_pengesahan" render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(!field.value && "text-muted-foreground")}
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
                <FormField control={form.control} name="country_code" render={({ field }) => (
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
                              placeholder="Cari negara..."
                              className="h-9"
                            />
                            <CommandList>
                              <CommandEmpty>
                                Negara tidak ditemukan.
                              </CommandEmpty>
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
                                          (lang) =>
                                            lang.value === field.value
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
                                          (lang) =>
                                            lang.value === field.value
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
                <FormField control={form.control} name="sertifikat" render={({ field }) => (
                    <FormItem>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div id="order">
                <FormLabel>Nomor Order</FormLabel>
                <FormField control={form.control} name="order" render={({ field }) => (
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
                <FormField control={form.control} name="tgl_mulai" render={({ field }) => (
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
                <FormField control={form.control} name="tgl_akhir" render={({ field }) => (
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
          <CardHeader><CardTitle>Deskripsi Objek yang Dikalibrasi/Diukur</CardTitle></CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-4">
              {itemFields.map((field, index) => (
                <div key={field.id} className="grid gap-4 border-b pb-4 relative">
                  <p className="text-sm text-muted-foreground">Objek {index + 1}</p>
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
                      <FormField control={form.control} name={`objects.${index}.jenis`} render={({ field }) => (
                          <FormItem>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div id="merek">
                      <FormLabel>Merek/Pembuat</FormLabel>
                      <FormField control={form.control} name={`objects.${index}.merek`} render={({ field }) => (
                          <FormItem>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div id="tipe">
                      <FormLabel>Tipe</FormLabel>
                      <FormField control={form.control} name={`objects.${index}.tipe`} render={({ field }) => (
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
                      <FormField control={form.control} name={`objects.${index}.item_issuer`} render={({ field }) => (
                          <FormItem>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                              <SelectContent>
                                <SelectItem value="manufacturer">manufacturer</SelectItem>
                                <SelectItem value="calibrationLaboratory">calibrationLaboratory</SelectItem>
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
                  <div className="grid grid-cols-2 gap-4">
                    <div id="seri_item">
                      <FormLabel>Nomor Seri</FormLabel>
                      <FormField control={form.control} name={`objects.${index}.seri_item`} render={({ field }) => (
                          <FormItem>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div id="id_lain">
                      <FormLabel>Identifikasi Lain</FormLabel>
                      <FormField control={form.control} name={`objects.${index}.id_lain`} render={({ field }) => (
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

        <Card id="resp-person">
          <CardHeader><CardTitle>Penanggung Jawab</CardTitle></CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-4">
              {personFields.map((field, index) => (
                <div key={field.id} className="grid gap-4 border-b pb-4 relative">
                  <p className="text-sm text-muted-foreground">Orang {index + 1}</p>
                  {personFields.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-0 right-0"
                      onClick={() => removePerson(index)}
                    >
                      ✕
                    </Button>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div id="nama_resp">
                      <FormLabel>Nama</FormLabel>
                      <FormField control={form.control} name={`responsible_persons.${index}.nama_resp`} render={({ field }) => (
                          <FormItem>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div id="nip">
                      <FormLabel>NIP</FormLabel>
                      <FormField control={form.control} name={`responsible_persons.${index}.nip`} render={({ field }) => (
                          <FormItem>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div id="peran">
                      <FormLabel>Peran</FormLabel>
                      <FormField control={form.control} name={`responsible_persons.${index}.peran`} render={({ field }) => (
                          <FormItem>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="pelaksana">Pelaksana Kalibrasi</SelectItem>
                                <SelectItem value="penyelia">Penyelia Kalibrasi</SelectItem>
                                <SelectItem value="kepala">Kepala Laboratorium</SelectItem>
                                <SelectItem value="tk">Direktur SNSU Termoelektrik dan Kimia</SelectItem>
                                <SelectItem value="mrb">Direktur SNSU Mekanika, Radiasi, dan Biologi</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div id="main_signer">
                      <FormLabel>Main Signer</FormLabel>
                      <FormField control={form.control} name={`responsible_persons.${index}.main_signer`} render={({ field }) => (
                          <FormItem>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                              <SelectContent>
                                <SelectItem value="true">Iya</SelectItem>
                                <SelectItem value="false">Tidak</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div id="signature">
                      <FormLabel>Signature</FormLabel>
                      <FormField control={form.control} name={`responsible_persons.${index}.signature`} render={({ field }) => (
                          <FormItem>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                              <SelectContent>
                                <SelectItem value="true">Iya</SelectItem>
                                <SelectItem value="false">Tidak</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div id="timestamp">
                      <FormLabel>Timestamp</FormLabel>
                      <FormField control={form.control} name={`responsible_persons.${index}.timestamp`} render={({ field }) => (
                          <FormItem>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                              <SelectContent>
                                <SelectItem value="true">Iya</SelectItem>
                                <SelectItem value="false">Tidak</SelectItem>
                              </SelectContent>
                            </Select>
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
                appendPerson({ nama_resp: "", nip: "", peran: "", main_signer: "", signature: "", timestamp: "" })
              }
            >
              <p className="text-xl">+</p>
            </Button>
          </CardContent>
        </Card>

        <Card id="customer">
          <CardHeader><CardTitle>Identitas Pemilik</CardTitle></CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-4">
              <div id="nama_cust">
                <FormLabel>Nama</FormLabel>
                <FormField control={form.control} name={`owner.nama_cust`} render={({ field }) => (
                    <FormItem>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div id="jalan_cust">
                  <FormLabel>Jalan</FormLabel>
                  <FormField control={form.control} name={`owner.jalan_cust`} render={({ field }) => (
                      <FormItem>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div id="no_jalan_cust">
                  <FormLabel>Nomor Jalan</FormLabel>
                  <FormField control={form.control} name={`owner.no_jalan_cust`} render={({ field }) => (
                      <FormItem>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div id="kota_cust">
                  <FormLabel>Kota</FormLabel>
                  <FormField control={form.control} name={`owner.kota_cust`} render={({ field }) => (
                      <FormItem>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div id="state_cust">
                  <FormLabel>Provinsi</FormLabel>
                  <FormField control={form.control} name={`owner.state_cust`} render={({ field }) => (
                      <FormItem>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div id="pos_cust">
                  <FormLabel>Kode Pos</FormLabel>
                  <FormField control={form.control} name={`owner.pos_cust`} render={({ field }) => (
                      <FormItem>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div id="negara_cust">
                  <FormLabel>Negara</FormLabel>
                  <FormField control={form.control} name={`owner.negara_cust`} render={({ field }) => (
                      <FormItem>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card id="statement">
          <CardHeader>
            <CardTitle>Statements/Pernyataan</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-1">
            {statementFields.map((field, index) => (
              <FormField
                control={form.control}
                key={field.id}
                name={`statements.${index}.value`}
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      {statementFields.length > 1 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => removeStatement(index)}
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
            <Button
              type="button"
              size="sm"
              className="mt-2 w-10 h-10 flex items-center justify-center mx-auto"
              onClick={() => appendStatement({ value: "" })}
            >
              <p className="text-xl">+</p>
            </Button>
          </CardContent>
        </Card>
        <div className="flex justify-end mt-4">
          <Button type="submit">Submit</Button>
        </div>
      </form>
    </FormProvider>
  );
}