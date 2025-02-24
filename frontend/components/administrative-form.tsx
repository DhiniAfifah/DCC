import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronsUpDown } from "lucide-react";
import { useFieldArray, useForm, FormProvider } from "react-hook-form";
import { z } from "zod";

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
  country: z.string(),
  usedLanguages: z.array(z.object({ value: z.string().min(1) })),
  mandatoryLanguages: z.array(z.object({ value: z.string().min(1) })),
  objects: z.array(
    z.object({
      jenis: z.string().optional(),
      merek: z.string().optional(),
      tipe: z.string().optional(),
      issuer: z.string().optional(),
      seri: z.string().optional(),
      idLain: z.string().optional(),
    })
  ),
  statements: z.array(z.object({ value: z.string().min(1) }))
});

export default function AdministrativeForm() {
  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      usedLanguages: [{ value: "" }],
      mandatoryLanguages: [{ value: "" }],
      objects: [{ jenis: "", merek: "", tipe: "", issuer: "", seri: "", idLain: "" }],
      statements: [{ value: "" }]
    },
  });

  const { fields: statementFields, append: appendStatement, remove: removeStatement } = useFieldArray({
    control: form.control,
    name: "statements",
  });

  const { fields: usedFields, append: appendUsed, remove: removeUsed } = useFieldArray({
    control: form.control,
    name: "usedLanguages",
  });

  const { fields: mandatoryFields, append: appendMandatory, remove: removeMandatory } = useFieldArray({
    control: form.control,
    name: "mandatoryLanguages",
  }); 

  const { fields: itemFields, append: appendItem } = useFieldArray({
    control: form.control,
    name: "objects",
  });

  return (
    <FormProvider {...form}>
      <form>
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

          <Card id="coreData">
            <CardHeader>
              <CardTitle>Data Inti</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="coreIssuer">Penerbit</Label>
                    <Select>
                      <SelectTrigger id="coreIssuer">
                        <SelectValue placeholder="Pilih penerbit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manufacturer">manufacturer</SelectItem>
                        <SelectItem value="calibrationLaboratory">calibrationLaboratory</SelectItem>
                        <SelectItem value="customer">customer</SelectItem>
                        <SelectItem value="owner">owner</SelectItem>
                        <SelectItem value="other">other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="countryCode">Kode Negara</Label>
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
                                      ? countries.find((country) => country.value === field.value)?.label
                                      : "Pilih negara"}
                                    <ChevronsUpDown className="opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                                <Command>
                                  <CommandInput placeholder="Cari negara..." className="h-9" />
                                  <CommandList>
                                    <CommandEmpty>Negara tidak ditemukan.</CommandEmpty>
                                    <CommandGroup>
                                      {countries.map((country) => (
                                        <CommandItem
                                          value={country.label}
                                          key={country.value}
                                          onSelect={() => {
                                            form.setValue("country", country.value);
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
                                      <Button variant="outline" className="w-full justify-between">
                                        {field.value ? languages.find(lang => lang.value === field.value)?.label : "Pilih bahasa"}
                                        <ChevronsUpDown className="opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-full p-0">
                                    <Command>
                                      <CommandInput placeholder="Cari bahasa..." className="h-9" />
                                      <CommandList>
                                        <CommandEmpty>Bahasa tidak ditemukan.</CommandEmpty>
                                        <CommandGroup>
                                          {languages.map(lang => (
                                            <CommandItem
                                              key={lang.value}
                                              onSelect={() => form.setValue(`usedLanguages.${index}.value`, lang.value)}
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
                    <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => appendUsed({ value: "" })}>
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
                                      <Button variant="outline" className="w-full justify-between">
                                        {field.value ? languages.find(lang => lang.value === field.value)?.label : "Pilih bahasa"}
                                        <ChevronsUpDown className="opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-full p-0">
                                    <Command>
                                      <CommandInput placeholder="Cari bahasa..." className="h-9" />
                                      <CommandList>
                                        <CommandEmpty>Bahasa tidak ditemukan.</CommandEmpty>
                                        <CommandGroup>
                                          {languages.map(lang => (
                                            <CommandItem
                                              key={lang.value}
                                              onSelect={() => form.setValue(`mandatoryLanguages.${index}.value`, lang.value)}
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
                    <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => appendMandatory({ value: "" })}>
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
                    <Label htmlFor="tglMulai">Tanggal Mulai Pengukuran</Label>
                    <Input id="tglMulai" type="date" />
                  </div>
                  <div>
                    <Label htmlFor="tglAkhir">Tanggal Akhir Pengukuran</Label>
                    <Input id="tglAkhir" type="date" />
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
                        <SelectItem value="laboratoryBranch">laboratoryBranch</SelectItem>
                        <SelectItem value="customerBranch">customerBranch</SelectItem>
                        <SelectItem value="other">other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="tglPengesahan">Tanggal pengesahan</Label>
                    <Input id="tglPengesahan" type="date" />
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
                  <div key={field.id} className="grid gap-4 border-b pb-4">
                    <p className="text-sm text-muted-foreground">Objek {index + 1}</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`jenis-${index}`}>Jenis Alat atau Objek</Label>
                        <Input id={`jenis-${index}`} {...form.register(`objects.${index}.jenis`)} />
                      </div>
                      <div>
                        <Label htmlFor={`merek-${index}`}>Merek/Pembuat</Label>
                        <Input id={`merek-${index}`} {...form.register(`objects.${index}.merek`)} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`tipe-${index}`}>Tipe</Label>
                        <Input id={`tipe-${index}`} {...form.register(`objects.${index}.tipe`)} />
                      </div>
                      <div>
                        <Label htmlFor={`itemIssuer-${index}`}>Identifikasi Alat</Label>
                        <Select {...form.register(`objects.${index}.issuer`)}>
                          <SelectTrigger id={`itemIssuer-${index}`}>
                            <SelectValue placeholder="Pilih penerbit" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="manufacturer">manufacturer</SelectItem>
                            <SelectItem value="calibrationLaboratory">calibrationLaboratory</SelectItem>
                            <SelectItem value="customer">customer</SelectItem>
                            <SelectItem value="owner">owner</SelectItem>
                            <SelectItem value="other">other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`seriItem-${index}`}>Nomor Seri</Label>
                        <Input id={`seriItem-${index}`} {...form.register(`objects.${index}.seri`)} />
                      </div>
                      <div>
                        <Label htmlFor={`idLain-${index}`}>Identifikasi Lain</Label>
                        <Input id={`idLain-${index}`} {...form.register(`objects.${index}.idLain`)} />
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
                  appendItem({ jenis: "", merek: "", tipe: "", issuer: "", seri: "", idLain: "" })
                }
              >
                <p className="text-xl">+</p>
              </Button>
            </CardContent>
          </Card>

          <Card id="respPerson">
            <CardHeader>
              <CardTitle>Penanggung Jawab</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="namaPejabat">Nama</Label>
                    <Input id="namaPejabat" />
                  </div>
                  <div>
                    <Label htmlFor="nip">NIP</Label>
                    <Input id="nip" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="peran">Peran</Label>
                    <Select>
                      <SelectTrigger id="peran">
                        <SelectValue placeholder="Pilih peran" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pelaksana">pelaksana kalibrasi</SelectItem>
                        <SelectItem value="penyelia">penyelia kalibrasi</SelectItem>
                        <SelectItem value="kepala">kepala Laboratorium</SelectItem>
                        <SelectItem value="tk">Direktur SNSU Termoelektrik dan Kimia</SelectItem>
                        <SelectItem value="mrb">Direktur SNSU Mekanika, Radiasi, dan Biologi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="mainSigner">Main Signer</Label>
                    <Select>
                      <SelectTrigger id="mainSigner">
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
                    <Label htmlFor="signature">Signature</Label>
                    <Select>
                      <SelectTrigger id="signature">
                        <SelectValue placeholder="" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Iya</SelectItem>
                        <SelectItem value="false">Tidak</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="timestamp">Timestamp</Label>
                    <Select>
                      <SelectTrigger id="timestamp">
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
            </CardContent>
          </Card>

          <Card id="customer">
            <CardHeader>
              <CardTitle>Identitas Pemilik</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="namaCust">Nama</Label>
                  <Input id="namaCust" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="jalanCust">Nama Jalan</Label>
                    <Input id="jalanCust" />
                  </div>
                  <div>
                    <Label htmlFor="noJalanCust">Nomor Jalan</Label>
                    <Input id="noJalanCust" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="kotaCust">Kota</Label>
                    <Input id="kotaCust" />
                  </div>
                  <div>
                    <Label htmlFor="stateCust">Provinsi</Label>
                    <Input id="stateCust" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="posCust">Kode Pos</Label>
                    <Input id="posCust" />
                  </div>
                  <div>
                    <Label htmlFor="negaraCust">Negara</Label>
                    <Input id="negaraCust" />
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
                          <Button type="button" variant="destructive" size="icon" onClick={() => removeStatement(index)}>
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
        </div>
      </form>
    </FormProvider>
  );
}
