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

const FormSchema = z.object({
  methods: z.array(
    z.object({
      method_name: z.string().min(1),
      method_desc: z.string().min(1),
      norm: z.string().min(1)
    })
  ),
  equipments: z.array(
    z.object({
      nama_alat: z.string().min(1),
      manuf_model: z.string().min(1),
      seri_measuring: z.string().min(1)
    })
  ),
  conditions: z.array(
    z.object({
      kondisi: z.string().min(1),
      kondisi_desc: z.string().min(1),
      seri_measuring: z.string().min(1)
    })
  )
});

export default function MeasurementForm() {
  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      methods: [{ method_name: "", method_desc: "", norm: "" }],
      equipments: [{ nama_alat: "", manuf_model: "", seri_measuring: "" }]
    },
  });

  const { fields: methodFields, append: appendMethod } = useFieldArray({
    control: form.control,
    name: "methods",
  });

  const { fields: equipmentFields, append: appendEquipment } = useFieldArray({
    control: form.control,
    name: "equipments",
  });

  return (
    <FormProvider {...form}>
      <form>
        <div className="space-y-6 max-w-4xl mx-auto p-4">
          <Card id="usedMethod">
            <CardHeader>
              <CardTitle>Metode</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-4">
                {methodFields.map((field, index) => (
                  <div key={field.id} className="grid gap-4 border-b pb-4">
                    <p className="text-sm text-muted-foreground">Metode {index + 1}</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`method_name-${index}`}>Nama</Label>
                        <Input id={`method_name-${index}`} {...form.register(`methods.${index}.method_name`)} />
                      </div>
                      <div>
                        <Label htmlFor={`norm-${index}`}>Norm</Label>
                        <Input id={`norm-${index}`} {...form.register(`methods.${index}.norm`)} />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor={`method_desc-${index}`}>Deskripsi</Label>
                      <Input id={`method_desc-${index}`} {...form.register(`methods.${index}.method_desc`)} />
                    </div>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                size="sm"
                className="mt-4 w-10 h-10 flex items-center justify-center mx-auto"
                onClick={() =>
                  appendMethod({ method_name: "", method_desc: "", norm: "" })
                }
              >
                <p className="text-xl">+</p>
              </Button>
            </CardContent>
          </Card>

          <Card id="measuringEquipment">
            <CardHeader>
              <CardTitle>Alat Pengukuran</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-4">
                {equipmentFields.map((field, index) => (
                  <div key={field.id} className="grid gap-4 border-b pb-4">
                    <p className="text-sm text-muted-foreground">Alat {index + 1}</p>
                    <div>
                      <Label htmlFor={`nama_alat-${index}`}>Nama</Label>
                      <Input id={`nama_alat-${index}`} {...form.register(`equipments.${index}.nama_alat`)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`manuf_model-${index}`}>Manufacturer dan Model</Label>
                        <Input id={`manuf_model-${index}`} {...form.register(`equipments.${index}.manuf_model`)} />
                      </div>
                      <div>
                        <Label htmlFor={`seri_measuring-${index}`}>Nomor Seri</Label>
                        <Input id={`seri_measuring-${index}`} {...form.register(`equipments.${index}.seri_measuring`)} />
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
                  appendEquipment({ nama_alat: "", manuf_model: "", seri_measuring: "" })
                }
              >
                <p className="text-xl">+</p>
              </Button>
            </CardContent>
          </Card>

          <Card id="influenceCondition">
            <CardHeader>
              <CardTitle>Kondisi Ruangan</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-4">
                {equipmentFields.map((field, index) => (
                  <div key={field.id} className="grid gap-4 border-b pb-4">
                    <p className="text-sm text-muted-foreground">Kondisi {index + 1}</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`manuf_model-${index}`}>Jenis Kondisi</Label>
                        <Input id={`manuf_model-${index}`} {...form.register(`equipments.${index}.manuf_model`)} />
                      </div>
                      <div>
                        <Label htmlFor={`seri_measuring-${index}`}>Deskripsi</Label>
                        <Input id={`seri_measuring-${index}`} {...form.register(`equipments.${index}.seri_measuring`)} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`manuf_model-${index}`}>Titik Tengah</Label>
                        <Input id={`manuf_model-${index}`} placeholder="Nilai" {...form.register(`equipments.${index}.manuf_model`)} />
                      </div>
                      <div>
                        <Input id={`seri_measuring-${index}`} placeholder="Satuan" {...form.register(`equipments.${index}.seri_measuring`)} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor={`manuf_model-${index}`}>Rentang</Label>
                        <Input id={`manuf_model-${index}`} placeholder="Nilai" {...form.register(`equipments.${index}.manuf_model`)} />
                      </div>
                      <div>
                        <Input id={`seri_measuring-${index}`} placeholder="Satuan" {...form.register(`equipments.${index}.seri_measuring`)} />
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
                  appendEquipment({ nama_alat: "", manuf_model: "", seri_measuring: "" })
                }
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