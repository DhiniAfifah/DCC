import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronsUpDown } from "lucide-react";
import { useFieldArray, useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { useEffect } from "react";
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
  Form,
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";

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

const empty_field_error_message = "Input diperlukan.";

const FormSchema = z.object({
  software: z.string().min(1, { message: empty_field_error_message }),
  version: z.string().min(1, { message: empty_field_error_message }),
  core_issuer: z.string({ required_error: empty_field_error_message }),
  country_code: z.string({ required_error: empty_field_error_message }),
  used_languages: z.array(
    z.object({ value: z.string().min(1, empty_field_error_message) })
  ),
  mandatory_languages: z.array(
    z.object({ value: z.string().min(1, empty_field_error_message) })
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
      seri: z.string().min(1, { message: empty_field_error_message }),
      id_lain: z.string().min(1, { message: empty_field_error_message }),
    })
  ),
  responsiblePersons: z.array(
    z.object({
      nama_resp: z.string().min(1, { message: empty_field_error_message }),
      nip: z.string().min(1, { message: empty_field_error_message }),
      peran: z.string().min(1, { message: empty_field_error_message }),
      mainSigner: z.string().min(1, { message: empty_field_error_message }),
      signature: z.string().min(1, { message: empty_field_error_message }),
      timestamp: z.string().min(1, { message: empty_field_error_message }),
    })
  ),
  nama_cust: z.string().min(1, { message: empty_field_error_message }),
  jalan_cust: z.string().min(1, { message: empty_field_error_message }),
  no_jalan_cust: z.string().min(1, { message: empty_field_error_message }),
  kota_cust: z.string().min(1, { message: empty_field_error_message }),
  state_cust: z.string().min(1, { message: empty_field_error_message }),
  pos_cust: z.string().min(1, { message: empty_field_error_message }),
  negara_cust: z.string().min(1, { message: empty_field_error_message }),
  statements: z.array(
    z.object({ value: z.string().min(1, empty_field_error_message) })
  ),
});

export default function AdministrativeForm({
  updateFormData,
}: {
  updateFormData: (data: any) => void;
}) {
  const form = useForm({
    resolver: zodResolver(FormSchema),
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
      objects: [
        {
          jenis: "",
          merek: "",
          tipe: "",
          item_issuer: "",
          seri: "",
          id_lain: "",
        },
      ],
      responsiblePersons: [
        {
          nama_resp: "",
          nip: "",
          peran: "",
          mainSigner: "",
          signature: "",
          timestamp: "",
        },
      ],
      nama_cust: "",
      jalan_cust: "",
      no_jalan_cust: "",
      kota_cust: "",
      state_cust: "",
      pos_cust: "",
      negara_cust: "",
      statements: [{ value: "" }],
    },
  });

  useEffect(() => {
    const subscription = form.watch((values) => {
      updateFormData(values);
    });

    return () => subscription.unsubscribe();
  }, [form.watch]);

  const {
    fields: statementFields,
    append: appendStatement,
    remove: removeStatement,
  } = useFieldArray({
    control: form.control,
    name: "statements",
  });

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
    name: "responsiblePersons",
  });

  const onSubmit = async (data: any) => {
    try {
      const response = await fetch("http://127.0.0.1:8000/create-dcc/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log("DCC Created:", result);
      alert(`DCC Created! Download: ${result.download_link}`);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 max-w-4xl mx-auto p-4"
      >
        <Card id="software">
          <CardHeader>
            <CardTitle>Software</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="software"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="version"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Versi</FormLabel>
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

        <Card id="core-data">
          <CardHeader>
            <CardTitle>Data Inti</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="core_issuer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Penerbit</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="text-muted-foreground">
                          <SelectValue placeholder="Pilih penerbit" />
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
              <FormField
                control={form.control}
                name="tempat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tempat Kalibrasi</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="text-muted-foreground">
                          <SelectValue placeholder="Pilih tempat" />
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
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tgl_pengesahan"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Tanggal Pengesahan</FormLabel>
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
                              <span>Pilih tanggal</span>
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
              <FormField
                control={form.control}
                name="country_code"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Kode Negara</FormLabel>
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
                              : "Pilih negara"}
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
                            <CommandEmpty>Negara tidak ditemukan.</CommandEmpty>
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
                  </FormItem>
                )}
              />
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
                                      : "Pilih bahasa"}
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
                                      : "Pilih bahasa"}
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
              <FormField
                control={form.control}
                name="sertifikat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nomor Sertifikat</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nomor Order</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tgl_mulai"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Tanggal Mulai Pengukuran</FormLabel>
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
                              <span>Pilih tanggal</span>
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
              <FormField
                control={form.control}
                name="tgl_akhir"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Tanggal Akhir Pengukuran</FormLabel>
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
                              <span>Pilih tanggal</span>
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
                    <div>
                      <Label id={`jenis-${index}`}>Jenis Alat atau Objek</Label>
                      <Input
                        id={`jenis-${index}`}
                        {...form.register(`objects.${index}.jenis`)}
                      />
                    </div>
                    <div>
                      <Label id={`merek-${index}`}>Merek/Pembuat</Label>
                      <Input
                        id={`merek-${index}`}
                        {...form.register(`objects.${index}.merek`)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label id={`tipe-${index}`}>Tipe</Label>
                      <Input
                        id={`tipe-${index}`}
                        {...form.register(`objects.${index}.tipe`)}
                      />
                    </div>
                    <div>
                      <Label id={`item_issuer-${index}`}>
                        Identifikasi Alat
                      </Label>
                      <Select
                        {...form.register(`objects.${index}.item_issuer`)}
                      >
                        <SelectTrigger id={`item_issuer-${index}`}>
                          <SelectValue placeholder="Pilih penerbit" />
                        </SelectTrigger>
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
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label id={`seri-item-${index}`}>Nomor Seri</Label>
                      <Input
                        id={`seri-item-${index}`}
                        {...form.register(`objects.${index}.seri`)}
                      />
                    </div>
                    <div>
                      <Label id={`id-lain-${index}`}>Identifikasi Lain</Label>
                      <Input
                        id={`id-lain-${index}`}
                        {...form.register(`objects.${index}.id_lain`)}
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
                  seri: "",
                  id_lain: "",
                })
              }
            >
              <p className="text-xl">+</p>
            </Button>
          </CardContent>
        </Card>

        <Card id="resp-person">
          <CardHeader>
            <CardTitle>Penanggung Jawab</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-4">
              {personFields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid gap-4 border-b pb-4 relative"
                >
                  <p className="text-sm text-muted-foreground">
                    Orang {index + 1}
                  </p>
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
                    <div>
                      <Label htmlFor={`nama_resp-${index}`}>Nama</Label>
                      <Input
                        id={`nama_resp-${index}`}
                        {...form.register(
                          `responsiblePersons.${index}.nama_resp`
                        )}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`nip-${index}`}>NIP</Label>
                      <Input
                        id={`nip-${index}`}
                        {...form.register(`responsiblePersons.${index}.nip`)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`peran-${index}`}>Peran</Label>
                      <Select
                        {...form.register(`responsiblePersons.${index}.peran`)}
                      >
                        <SelectTrigger id={`peran-${index}`}>
                          <SelectValue placeholder="Pilih peran" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pelaksana">
                            Pelaksana Kalibrasi
                          </SelectItem>
                          <SelectItem value="penyelia">
                            Penyelia Kalibrasi
                          </SelectItem>
                          <SelectItem value="kepala">
                            Kepala Laboratorium
                          </SelectItem>
                          <SelectItem value="tk">
                            Direktur SNSU Termoelektrik dan Kimia
                          </SelectItem>
                          <SelectItem value="mrb">
                            Direktur SNSU Mekanika, Radiasi, dan Biologi
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor={`main-signer-${index}`}>
                        Main Signer
                      </Label>
                      <Select
                        {...form.register(
                          `responsiblePersons.${index}.mainSigner`
                        )}
                      >
                        <SelectTrigger id={`main-signer-${index}`}>
                          <SelectValue placeholder="" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Iya</SelectItem>
                          <SelectItem value="false">Tidak</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`signature-${index}`}>Signature</Label>
                      <Select
                        {...form.register(
                          `responsiblePersons.${index}.signature`
                        )}
                      >
                        <SelectTrigger id={`signature-${index}`}>
                          <SelectValue placeholder="" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Iya</SelectItem>
                          <SelectItem value="false">Tidak</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor={`timestamp-${index}`}>Timestamp</Label>
                      <Select
                        {...form.register(
                          `responsiblePersons.${index}.timestamp`
                        )}
                      >
                        <SelectTrigger id={`timestamp-${index}`}>
                          <SelectValue placeholder="" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Iya</SelectItem>
                          <SelectItem value="false">Tidak</SelectItem>
                        </SelectContent>
                      </Select>
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
                appendPerson({
                  nama_resp: "",
                  nip: "",
                  peran: "",
                  mainSigner: "",
                  signature: "",
                  timestamp: "",
                })
              }
            >
              <p className="text-xl">+</p>
            </Button>
          </CardContent>
        </Card>

        <Card id="customer">
          <CardHeader>
            <CardTitle>Identitas Pemilik</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="nama_cust"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="jalan_cust"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Jalan</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="no_jalan_cust"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor Jalan</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="kota_cust"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kota</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="state_cust"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provinsi</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="pos_cust"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kode Pos</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="negara_cust"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Negara</FormLabel>
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
      </form>
    </FormProvider>
  );
}
