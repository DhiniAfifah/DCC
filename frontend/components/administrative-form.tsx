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

const FormSchema = z.object({
  country: z.string({ required_error: "Please select a country." }),
  usedLanguages: z.array(z.object({ value: z.string().min(1, "Please select a language.") })),
  mandatoryLanguages: z.array(z.object({ value: z.string().min(1, "Please select a language.") })),
  objects: z.array(z.object({
    jenis: z.string().optional(),
    merek: z.string().optional(),
    tipe: z.string().optional(),
    issuer: z.string().optional(),
    seri: z.string().optional(),
    idLain: z.string().optional(),
  })),
  responsiblePersons: z.array(z.object({
    nama: z.string().optional(),
    nip: z.string().optional(),
    peran: z.string().optional(),
    mainSigner: z.string().optional(),
    signature: z.string().optional(),
    timestamp: z.string().optional(),
  })),
  statements: z.array(z.object({ value: z.string().min(1, "Statement cannot be empty") })),
});

export default function AdministrativeForm({updateFormData}: {updateFormData: (data: any) => void;}) {
  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      usedLanguages: [{ value: "" }],
      mandatoryLanguages: [{ value: "" }],
      objects: [{ jenis: "", merek: "", tipe: "", issuer: "", seri: "", idLain: "" }],
      responsiblePersons: [{ nama: "", nip: "", peran: "", mainSigner: "", signature: "", timestamp: "" }],
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
    name: "usedLanguages",
  });

  const {
    fields: mandatoryFields,
    append: appendMandatory,
    remove: removeMandatory,
  } = useFieldArray({
    control: form.control,
    name: "mandatoryLanguages",
  });

  const { fields: itemFields, append: appendItem, remove: removeItem } = useFieldArray({
    control: form.control,
    name: "objects",
  });

  const { fields: personFields, append: appendPerson, remove: removePerson } = useFieldArray({
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
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-6 max-w-4xl mx-auto p-4">
          <Card id="software">
            <CardHeader>
              <CardTitle>Software</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="software">Nama</Label>
                    <Input id="software" />
                  </div>
                  <div>
                    <Label htmlFor="version">Versi</Label>
                    <Input id="version" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card id="core-data">
            <CardHeader>
              <CardTitle>Data Inti</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="core-issuer">Penerbit</Label>
                    <Select>
                      <SelectTrigger id="core-issuer">
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
                  <div>
                    <Label htmlFor="country-code">Kode Negara</Label>
                    <Form {...form}>
                      <FormField
                        control={form.control}
                        name="country"
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
                                              "country",
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
                    </Form>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FormLabel>Bahasa yang Digunakan</FormLabel>
                    <div className="space-y-2">
                      {usedFields.map((field, index) => (
                        <FormField
                          key={field.id}
                          control={form.control}
                          name={`usedLanguages.${index}.value`}
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant="outline"
                                        className="w-full justify-between"
                                      >
                                        {field.value
                                          ? languages.find(
                                              (lang) =>
                                                lang.value === field.value
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
                                                  `usedLanguages.${index}.value`,
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
                  <div>
                    <FormLabel>Bahasa Wajib</FormLabel>
                    <div className="space-y-2">
                      {mandatoryFields.map((field, index) => (
                        <FormField
                          key={field.id}
                          control={form.control}
                          name={`mandatoryLanguages.${index}.value`}
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant="outline"
                                        className="w-full justify-between"
                                      >
                                        {field.value
                                          ? languages.find(
                                              (lang) =>
                                                lang.value === field.value
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
                                                  `mandatoryLanguages.${index}.value`,
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
                  <div>
                    <Label htmlFor="sertifikat">Nomor Sertifikat</Label>
                    <Input id="sertifikat" />
                  </div>
                  <div>
                    <Label htmlFor="order">Nomor Order</Label>
                    <Input id="order" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tgl-mulai">Tanggal Mulai Pengukuran</Label>
                    <Input id="tgl-mulai" type="date" />
                  </div>
                  <div>
                    <Label htmlFor="tgl-akhir">Tanggal Akhir Pengukuran</Label>
                    <Input id="tgl-akhir" type="date" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tempat">Tempat Kalibrasi</Label>
                    <Select>
                      <SelectTrigger id="tempat">
                        <SelectValue placeholder="Pilih tempat" />
                      </SelectTrigger>
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
                  </div>
                  <div>
                    <Label htmlFor="tgl-pengesahan">Tanggal pengesahan</Label>
                    <Input id="tgl-pengesahan" type="date" />
                  </div>
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
                  <div key={field.id} className="grid gap-4 border-b pb-4 relative">
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
                        <Label htmlFor={`jenis-${index}`}>
                          Jenis Alat atau Objek
                        </Label>
                        <Input
                          id={`jenis-${index}`}
                          {...form.register(`objects.${index}.jenis`)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`merek-${index}`}>Merek/Pembuat</Label>
                        <Input
                          id={`merek-${index}`}
                          {...form.register(`objects.${index}.merek`)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`tipe-${index}`}>Tipe</Label>
                        <Input
                          id={`tipe-${index}`}
                          {...form.register(`objects.${index}.tipe`)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`item-issuer-${index}`}>
                          Identifikasi Alat
                        </Label>
                        <Select {...form.register(`objects.${index}.issuer`)}>
                          <SelectTrigger id={`item-issuer-${index}`}>
                            <SelectValue placeholder="Pilih penerbit" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="manufacturer">
                              Manufacturer
                            </SelectItem>
                            <SelectItem value="calibrationLaboratory">
                              Calibration Laboratory
                            </SelectItem>
                            <SelectItem value="customer">Customer</SelectItem>
                            <SelectItem value="owner">Owner</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`seri-item-${index}`}>Nomor Seri</Label>
                        <Input
                          id={`seri-item-${index}`}
                          {...form.register(`objects.${index}.seri`)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`id-lain-${index}`}>
                          Identifikasi Lain
                        </Label>
                        <Input
                          id={`id-lain-${index}`}
                          {...form.register(`objects.${index}.idLain`)}
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
                    issuer: "",
                    seri: "",
                    idLain: "",
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
                      <div>
                        <Label htmlFor={`nama-${index}`}>Nama</Label>
                        <Input id={`nama-${index}`} {...form.register(`responsiblePersons.${index}.nama`)} />
                      </div>
                      <div>
                        <Label htmlFor={`nip-${index}`}>NIP</Label>
                        <Input id={`nip-${index}`} {...form.register(`responsiblePersons.${index}.nip`)} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`peran-${index}`}>Peran</Label>
                        <Select {...form.register(`responsiblePersons.${index}.peran`)}>
                          <SelectTrigger id={`peran-${index}`}>
                            <SelectValue placeholder="Pilih peran" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pelaksana">Pelaksana Kalibrasi</SelectItem>
                            <SelectItem value="penyelia">Penyelia Kalibrasi</SelectItem>
                            <SelectItem value="kepala">Kepala Laboratorium</SelectItem>
                            <SelectItem value="tk">Direktur SNSU Termoelektrik dan Kimia</SelectItem>
                            <SelectItem value="mrb">Direktur SNSU Mekanika, Radiasi, dan Biologi</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor={`main-signer-${index}`}>Main Signer</Label>
                        <Select {...form.register(`responsiblePersons.${index}.mainSigner`)}>
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
                        <Select {...form.register(`responsiblePersons.${index}.signature`)}>
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
                        <Select {...form.register(`responsiblePersons.${index}.timestamp`)}>
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
                  appendPerson({ nama: "", nip: "", peran: "", mainSigner: "", signature: "", timestamp: "" })
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
                <div>
                  <Label htmlFor="nama-cust">Nama</Label>
                  <Input id="nama-cust" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="jalan-cust">Nama Jalan</Label>
                    <Input id="jalan-cust" />
                  </div>
                  <div>
                    <Label htmlFor="no-jalan-cust">Nomor Jalan</Label>
                    <Input id="no-jalan-cust" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="kota-cust">Kota</Label>
                    <Input id="kota-cust" />
                  </div>
                  <div>
                    <Label htmlFor="state-cust">Provinsi</Label>
                    <Input id="state-cust" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pos-cust">Kode Pos</Label>
                    <Input id="pos-cust" />
                  </div>
                  <div>
                    <Label htmlFor="negara-cust">Negara</Label>
                    <Input id="negara-cust" />
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
        </div>
      </form>
    </FormProvider>
  );
}