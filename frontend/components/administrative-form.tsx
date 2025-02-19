import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
  country: z.string({
    required_error: "Please select a country.",
  }),
  language: z.string({
    required_error: "Please select a language.",
  }),
});

export default function AdministrativeForm() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4">
      <Card>
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

      <Card>
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
                    <SelectItem value="manufacturer">manufacturer</SelectItem>
                    <SelectItem value="calibrationLaboratory">calibrationLaboratory</SelectItem>
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
                <Label htmlFor="used-lang">Bahasa yang Digunakan</Label>
                <Form {...form}>
                  <FormField
                    control={form.control}
                    name="language"
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
                                  ? languages.find((lang) => lang.value === field.value)?.label
                                  : "Pilih bahasa"}
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
                                  {languages.map((lang) => (
                                    <CommandItem
                                      value={lang.label}
                                      key={lang.value}
                                      onSelect={() => {
                                        form.setValue("language", lang.value);
                                      }}
                                    >
                                      {lang.label}
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
              <div>
                <Label htmlFor="mandatory-lang">Bahasa Wajib</Label>
                <Form {...form}>
                  <FormField
                    control={form.control}
                    name="language"
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
                                  ? languages.find((lang) => lang.value === field.value)?.label
                                  : "Pilih bahasa"}
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
                                  {languages.map((lang) => (
                                    <CommandItem
                                      value={lang.label}
                                      key={lang.value}
                                      onSelect={() => {
                                        form.setValue("language", lang.value);
                                      }}
                                    >
                                      {lang.label}
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
                    <SelectItem value="laboratoryBranch">laboratoryBranch</SelectItem>
                    <SelectItem value="customerBranch">customerBranch</SelectItem>
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

      <Card>
        <CardHeader>
          <CardTitle>Deskripsi Objek yang Dikalibrasi/Diukur</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="jenis">Jenis Alat atau Objek</Label>
                <Input id="jenis" />
              </div>
              <div>
                <Label htmlFor="merek">Merek/Pembuat</Label>
                <Input id="merek" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tipe">Tipe</Label>
                <Input id="tipe" />
              </div>
              <div>
                <Label htmlFor="item-issuer">Identifikasi Alat</Label>
                <Select>
                  <SelectTrigger id="item-issuer">
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
                <Label htmlFor="seri-item">Nomor Seri</Label>
                <Input id="seri-item" />
              </div>
              <div>
                <Label htmlFor="id-lain">Identifikasi Lain</Label>
                <Input id="id-lain" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Penanggung Jawab</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nama-pejabat">Nama</Label>
                <Input id="nama-pejabat" />
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
                <Label htmlFor="main-signer">Main Signer</Label>
                <Select>
                  <SelectTrigger id="main-signer">
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

      <Card>
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

      <Card>
        <CardHeader>
          <CardTitle>Statement</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <Input id="statement" />
        </CardContent>
      </Card>
    </div>
  );
}
